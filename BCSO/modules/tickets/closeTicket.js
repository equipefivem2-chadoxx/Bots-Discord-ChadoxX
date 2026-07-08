const axios = require('axios');
const config = require('../../config.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'close_op_ticket') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            const archiveChannel = interaction.guild.channels.cache.get(config.archiveChannelId);

            if (!archiveChannel) {
                return interaction.editReply({ content: "❌ Salon d'archive Discord introuvable dans la config." });
            }

            await interaction.editReply({ content: "⏳ Analyse et téléchargement des preuves en cours..." });

            let allMessages = [];

            // 1. On récupère les messages du salon principal
            const mainMessages = await channel.messages.fetch({ limit: 100 });
            const sortedMain = Array.from(mainMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            allMessages.push(...sortedMain);

            // 🚀 DÉTECTION DU CRÉATEUR
            let creatorName = channel.topic;
            if (!creatorName) {
                const firstMsg = sortedMain.find(m => m.content.includes("a ouvert un dossier d'opération"));
                if (firstMsg && firstMsg.mentions.members.size > 0) {
                    creatorName = firstMsg.mentions.members.first().displayName;
                } else {
                    creatorName = 'Agent Inconnu';
                }
            }

            // 2. On récupère les fils (Threads)
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

            // 3. 🚀 SÉCURITÉ ABSOLUE : Téléchargement et encodage des images en Base64
            const formattedMessages = [];
            
            for (const msg of allMessages) {
                let content = msg.content ? msg.content.trim() : '';
                let base64Images = [];
                
                if (msg.attachments.size > 0) {
                    const attachments = Array.from(msg.attachments.values());
                    for (const att of attachments) {
                        // On ne traite que les images
                        if (att.contentType && att.contentType.startsWith('image/')) {
                            try {
                                // On télécharge l'image depuis Discord avant de supprimer le salon
                                const response = await axios.get(att.url, { responseType: 'arraybuffer' });
                                const base64Data = Buffer.from(response.data, 'binary').toString('base64');
                                const dataUri = `data:${att.contentType};base64,${base64Data}`;
                                base64Images.push(dataUri);
                            } catch (imgError) {
                                console.error(`Erreur téléchargement image : ${att.url}`, imgError.message);
                            }
                        }
                    }
                }

                // On attache les images sous format "[IMAGE] data:image/png;base64,....."
                if (base64Images.length > 0) {
                    content = content ? `${content} [IMAGE] ${base64Images.join(' ')}` : `[IMAGE] ${base64Images.join(' ')}`;
                }

                if (content !== '') {
                    const finalAuthorName = msg.member ? msg.member.displayName : (msg.author ? msg.author.username : 'Système');
                    formattedMessages.push({
                        author: finalAuthorName,
                        content: content,
                        timestamp: new Date(msg.createdTimestamp).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
                    });
                }
            }

            await interaction.editReply({ content: "⏳ Création des fichiers de sauvegarde..." });

            // 4. Génération de l'archive HTML Discord (Images incluses ou allégée)
            const transcript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true,
                poweredBy: false
            });

            try {
                await archiveChannel.send({
                    content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>\n*Sauvegarde de sécurité Discord.*`,
                    files: [transcript]
                });
            } catch (sendError) {
                if (sendError.code === 40005) {
                    const lightTranscript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                        returnBuffer: false, filename: `LIGHT-${channel.name}.html`, saveImages: false, poweredBy: false
                    });
                    await archiveChannel.send({
                        content: `⚠️ Fichier d'origine trop lourd. Voici la version "Allégée".\n📁 **Archive :** ${channel.name}`,
                        files: [lightTranscript]
                    });
                }
            }

            // 5. Envoi vers l'API du Site Web (Maintenant l'API reçoit les images en "dur")
            const payload = {
                ticketId: channel.id,
                channelName: channel.name,
                openedBy: creatorName,
                closedBy: interaction.member ? interaction.member.displayName : interaction.user.username,
                motif: channel.name.split('-')[0] || 'Dossier',
                messages: formattedMessages
            };

            await interaction.editReply({ content: "⏳ Synchronisation avec la base de données..." });

            await axios.post('https://bcso-noface.up.railway.app/api/tickets/transcript', payload);
            
            await interaction.editReply({ content: "✅ Dossier archivé (Preuves sécurisées à vie). Suppression dans 3s..." });

            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur de clôture:", error);
            await interaction.channel.send("⚠️ **Alerte Serveur Central :** Erreur lors de la fermeture du dossier. (Taille des preuves potentiellement trop lourde)");
            await interaction.editReply({ content: "❌ Échec de la fermeture." }).catch(() => {});
        }
    });
};