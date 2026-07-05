const { AttachmentBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const axios = require('axios'); // 🚀 AJOUTÉ : Importation d'Axios pour l'API web
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

            // 🚀 NOUVEAU : 5. Envoi vers le site web BCSO (MDT)
            await interaction.editReply({ content: "⏳ Synchronisation avec la base de données centrale BCSO..." });
            
            try {
                // Formatage des messages pour le site web
                const formattedMessages = allMessages.map(msg => ({
                    author: msg.author ? msg.author.tag : 'Système',
                    content: msg.content || '[Fichier ou image (voir archive Discord)]',
                    timestamp: new Date(msg.createdTimestamp).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
                }));

                const payload = {
                    ticketId: channel.id,
                    channelName: channel.name,
                    openedBy: channel.topic || 'Agent', // Utilise le topic du salon, ou "Agent" par défaut
                    closedBy: interaction.member ? interaction.member.displayName : interaction.user.username,
                    motif: channel.name.split('-')[0] || 'Dossier',
                    messages: formattedMessages
                };

                // Envoi à l'API de ton site web
                await axios.post('https://bcso-noface.up.railway.app/api/tickets/transcript', payload);
                
                await interaction.editReply({ content: "✅ Dossier archivé et synchronisé avec succès. Suppression dans 3s..." });

                // 6. Suppression sécurisée (seulement si l'envoi web a réussi)
                setTimeout(() => {
                    channel.delete().catch(err => console.error("Erreur suppression:", err));
                }, 3000);

            } catch (apiError) {
                console.error("🔴 Erreur API web:", apiError.message);
                await channel.send("⚠️ **Alerte Serveur Central :** Impossible de synchroniser ce dossier avec le MDT web. Le salon n'a **pas** été supprimé pour éviter la perte des données.");
                await interaction.editReply({ content: "❌ Échec de la synchronisation web." });
            }

        } catch (error) {
            console.error("❌ Erreur transcript complet:", error);
            await interaction.editReply({ content: "❌ Erreur lors de l'archivage complet." }).catch(() => {});
        }
    });
};