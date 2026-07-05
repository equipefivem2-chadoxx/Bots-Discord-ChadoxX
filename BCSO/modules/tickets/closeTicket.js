const axios = require('axios');
const config = require('../../config.js');
const discordTranscripts = require('discord-html-transcripts'); // 🚀 RESTAURÉ

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

            await interaction.editReply({ content: "⏳ Génération de l'archive et synchronisation web..." });

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

            // 2. On récupère les fils
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

            // 3. Formatage pour le Site Web
            const formattedMessages = [];
            allMessages.forEach(msg => {
                let content = msg.content ? msg.content.trim() : '';
                
                if (msg.attachments.size > 0) {
                    const imageLinks = Array.from(msg.attachments.values()).map(a => a.url).join(' ');
                    content = content ? `${content} [IMAGE] ${imageLinks}` : `[IMAGE] ${imageLinks}`;
                }

                if (content !== '') {
                    const finalAuthorName = msg.member ? msg.member.displayName : (msg.author ? msg.author.username : 'Système');
                    formattedMessages.push({
                        author: finalAuthorName,
                        content: content,
                        timestamp: new Date(msg.createdTimestamp).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
                    });
                }
            });

            // 4. Génération de l'archive HTML Discord (Images incluses)
            const transcript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true, // 🚀 Force la sauvegarde des images en Base64 pour contrer la sécurité Discord
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

            // 5. Envoi vers l'API du Site Web
            const payload = {
                ticketId: channel.id,
                channelName: channel.name,
                openedBy: creatorName,
                closedBy: interaction.member ? interaction.member.displayName : interaction.user.username,
                motif: channel.name.split('-')[0] || 'Dossier',
                messages: formattedMessages
            };

            await axios.post('https://bcso-noface.up.railway.app/api/tickets/transcript', payload);
            
            await interaction.editReply({ content: "✅ cDossier archivé sur le Discord et le MDT. Suppression dans 3s..." });

            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur de clôture:", error);
            await interaction.channel.send("⚠️ **Alerte Serveur Central :** Erreur lors de la fermeture du dossier.");
            await interaction.editReply({ content: "❌ Échec de la fermeture." }).catch(() => {});
        }
    });
};