const { AttachmentBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'close_op_ticket') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            const archiveChannel = interaction.guild.channels.cache.get(config.archiveChannelId);

            if (!archiveChannel) {
                return interaction.editReply({ content: "❌ Salon d'archive introuvable." });
            }

            await interaction.editReply({ content: "⏳ Organisation du dossier par chapitres en cours..." });

            let allMessages = [];

            // 1. On récupère les messages du salon principal
            const mainMessages = await channel.messages.fetch({ limit: 100 });
            const sortedMain = Array.from(mainMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            allMessages.push(...sortedMain);

            // 2. On boucle sur chaque fil pour créer les chapitres
            const fetchedThreads = await channel.threads.fetch();
            for (const [threadId, thread] of fetchedThreads.threads) {
                const separatorMsg = await channel.send({
                    content: `\n> ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n> 📂 **DÉBUT DE LA SECTION : ${thread.name.toUpperCase()}**\n> ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
                });
                allMessages.push(separatorMsg);

                const threadMessages = await thread.messages.fetch({ limit: 100 });
                const sortedThread = Array.from(threadMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
                allMessages.push(...sortedThread);
            }

            // 3. Génération Tentative 1 : Qualité MAX (Images intégrées)
            const transcript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true,
                poweredBy: false
            });

            // 4. Envoi avec bouclier anti-crash 🛡️
            try {
                // On essaie d'envoyer le fichier lourd
                await archiveChannel.send({
                    content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>\n*Les données ont été classées par section.*`,
                    files: [transcript]
                });
            } catch (sendError) {
                // Si l'erreur est 40005 (Entity too large), on active le plan B
                if (sendError.code === 40005) {
                    console.warn(`⚠️ Fichier trop lourd pour ${channel.name}, génération de la version allégée...`);
                    
                    // On regénère en passant saveImages à FALSE
                    const lightTranscript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                        returnBuffer: false,
                        filename: `LIGHT-${channel.name}.html`,
                        saveImages: false, // 👈 Le Plan B est ici
                        poweredBy: false
                    });

                    await archiveChannel.send({
                        content: `⚠️ **Avertissement :** Le dossier d'origine contenait trop de photos et dépassait la limite de Discord (25 Mo).\nVoici la version "Allégée" générée automatiquement (les images utilisent des liens externes).\n\n📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>`,
                        files: [lightTranscript]
                    });
                } else {
                    // Si c'est une autre erreur bizarre, on la laisse remonter
                    throw sendError; 
                }
            }

            await interaction.editReply({ content: "✅ Dossier organisé et archivé avec succès. Suppression dans 3s..." });

            // 5. Suppression
            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur transcript complet:", error);
            await interaction.editReply({ content: "❌ Erreur lors de l'archivage complet." }).catch(() => {});
        }
    });
};