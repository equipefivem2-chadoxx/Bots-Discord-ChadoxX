const axios = require('axios');
const config = require('../../config.js');
const discordTranscripts = require('discord-html-transcripts');
const cloudinary = require('../cloudinary/cloudinary.js'); // 🚀 L'import de ton nouveau module

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'close_op_ticket') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            const archiveChannel = interaction.guild.channels.cache.get(config.archiveChannelId);

            if (!archiveChannel) {
                return interaction.editReply({ content: "❌ Salon d'archive Discord introuvable." });
            }

            await interaction.editReply({ content: "⏳ Analyse du dossier et upload Cloudinary en cours..." });

            let allMessages = [];

            // 1. Récupération des messages principaux
            const mainMessages = await channel.messages.fetch({ limit: 100 });
            const sortedMain = Array.from(mainMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            allMessages.push(...sortedMain);

            // DÉTECTION DU CRÉATEUR
            let creatorName = channel.topic;
            if (!creatorName) {
                const firstMsg = sortedMain.find(m => m.content.includes("a ouvert un dossier d'opération"));
                if (firstMsg && firstMsg.mentions.members.size > 0) {
                    creatorName = firstMsg.mentions.members.first().displayName;
                } else {
                    creatorName = 'Agent Inconnu';
                }
            }

            // 2. Récupération des fils (Threads)
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

            // 3. 🚀 EXTRACTION ET UPLOAD SUR CLOUDINARY
            const formattedMessages = [];
            
            for (const msg of allMessages) {
                let content = msg.content ? msg.content.trim() : '';
                let imageUrls = [];
                
                if (msg.attachments.size > 0) {
                    const attachments = Array.from(msg.attachments.values());
                    for (const att of attachments) {
                        if (att.contentType && att.contentType.startsWith('image/')) {
                            try {
                                // On télécharge l'image depuis Discord...
                                const response = await axios.get(att.url, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data, 'binary');
                                
                                // ... Puis on l'uploade immédiatement sur Cloudinary
                                const cloudinaryResult = await new Promise((resolve, reject) => {
                                    const uploadStream = cloudinary.uploader.upload_stream(
                                        { folder: "bcso_preuves" }, // Crée un dossier propre sur ton Cloudinary
                                        (error, result) => {
                                            if (result) resolve(result);
                                            else reject(error);
                                        }
                                    );
                                    uploadStream.end(buffer);
                                });

                                // On récupère le lien sécurisé (https) de Cloudinary
                                imageUrls.push(cloudinaryResult.secure_url);
                                
                            } catch (imgError) {
                                console.error(`❌ Erreur Upload Cloudinary :`, imgError);
                            }
                        }
                    }
                }

                // On attache les liens Cloudinary au message : "[IMAGE] https://res.cloudinary.com/..."
                if (imageUrls.length > 0) {
                    content = content ? `${content} [IMAGE] ${imageUrls.join(' ')}` : `[IMAGE] ${imageUrls.join(' ')}`;
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

            await interaction.editReply({ content: "⏳ Finalisation de la sauvegarde HTML..." });

            // 4. Archive HTML Discord classique
            const transcript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                returnBuffer: false, filename: `${channel.name}.html`, saveImages: true, poweredBy: false
            });

            try {
                await archiveChannel.send({
                    content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>`,
                    files: [transcript]
                });
            } catch (sendError) {
                if (sendError.code === 40005) {
                    const lightTranscript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                        returnBuffer: false, filename: `LIGHT-${channel.name}.html`, saveImages: false, poweredBy: false
                    });
                    await archiveChannel.send({
                        content: `⚠️ Fichier d'origine trop lourd. Version "Allégée".\n📁 **Archive :** ${channel.name}`,
                        files: [lightTranscript]
                    });
                }
            }

            // 5. Envoi vers le Site Web (Payload ultra-léger, seulement du texte et des URLs)
            const payload = {
                ticketId: channel.id,
                channelName: channel.name,
                openedBy: creatorName,
                closedBy: interaction.member ? interaction.member.displayName : interaction.user.username,
                motif: channel.name.split('-')[0] || 'Dossier',
                messages: formattedMessages
            };

            await interaction.editReply({ content: "⏳ Synchronisation de l'API web..." });

            await axios.post('https://bcso-noface.up.railway.app/api/tickets/transcript', payload);
            
            await interaction.editReply({ content: "✅ Opération terminée avec succès. Fermeture du dossier..." });

            setTimeout(() => { channel.delete().catch(() => {}); }, 3000);

        } catch (error) {
            console.error("❌ Erreur de clôture:", error);
            await interaction.editReply({ content: "❌ Une erreur est survenue. Les preuves étaient peut-être trop volumineuses." }).catch(() => {});
        }
    });
};