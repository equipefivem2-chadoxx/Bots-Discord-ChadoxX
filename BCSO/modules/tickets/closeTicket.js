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

            // Ce tableau va contenir les messages triés PAR SECTION, pas par ordre chronologique global
            let allMessages = [];

            // 1. On récupère et on trie les messages du salon principal
            const mainMessages = await channel.messages.fetch({ limit: 100 });
            const sortedMain = Array.from(mainMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            allMessages.push(...sortedMain);

            // 2. On boucle sur chaque fil pour créer les chapitres
            const fetchedThreads = await channel.threads.fetch();
            for (const [threadId, thread] of fetchedThreads.threads) {
                
                // On fait générer au bot un faux message de séparation dans le ticket
                // Cela créera une grosse barre de titre dans le HTML
                const separatorMsg = await channel.send({
                    content: `\n> ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n> 📂 **DÉBUT DE LA SECTION : ${thread.name.toUpperCase()}**\n> ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`
                });

                // On ajoute ce séparateur à notre liste de messages
                allMessages.push(separatorMsg);

                // On récupère les messages de ce fil spécifique
                const threadMessages = await thread.messages.fetch({ limit: 100 });
                const sortedThread = Array.from(threadMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
                
                // On ajoute les messages du fil JUSTE APRÈS le séparateur
                allMessages.push(...sortedThread);
            }

            // 3. Génération du HTML à partir de notre tableau parfaitement organisé
            // Le module va lire notre tableau et dessiner la page exactement dans cet ordre
            const transcript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true,
                poweredBy: false
            });

            // 4. Envoi de l'archive unique et bien classée
            await archiveChannel.send({
                content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>\n*Les données ont été classées par section (Rapport, Suspects, etc.).*`,
                files: [transcript]
            });

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