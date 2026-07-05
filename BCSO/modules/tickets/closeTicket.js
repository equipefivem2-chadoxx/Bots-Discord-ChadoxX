const axios = require('axios');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'close_op_ticket') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            await interaction.editReply({ content: "⏳ Organisation et synchronisation du dossier..." });

            let allMessages = [];

            // 1. On récupère les messages du salon principal
            const mainMessages = await channel.messages.fetch({ limit: 100 });
            const sortedMain = Array.from(mainMessages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            allMessages.push(...sortedMain);

            // 🚀 DÉTECTION DU CRÉATEUR : On utilise le Sujet (Topic) du salon qu'on a créé dans openTicket.js
            let creatorName = channel.topic;
            
            // Sécurité au cas où le topic a été supprimé manuellement :
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

            // 3. Formatage & Nettoyage (Fini les messages "vides" et Pseudos Serveur)
            const formattedMessages = [];
            allMessages.forEach(msg => {
                let content = msg.content ? msg.content.trim() : '';
                
                // Détection des images
                if (msg.attachments.size > 0) {
                    const imageLinks = Array.from(msg.attachments.values()).map(a => a.url).join(' ');
                    // 🚀 AJOUT D'ESPACES AUTOUR DU TAG POUR ÉVITER QUE LES URLS FUSIONNENT
                    content = content ? `${content} [IMAGE] ${imageLinks}` : `[IMAGE] ${imageLinks}`;
                }

                // Si le message n'est pas vide, on le sauvegarde pour le site
                if (content !== '') {
                    const finalAuthorName = msg.member ? msg.member.displayName : (msg.author ? msg.author.username : 'Système');

                    formattedMessages.push({
                        author: finalAuthorName,
                        content: content,
                        timestamp: new Date(msg.createdTimestamp).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
                    });
                }
            });

            // 4. Envoi 100% web
            const payload = {
                ticketId: channel.id,
                channelName: channel.name,
                openedBy: creatorName, // 🚀 Créateur infaillible
                closedBy: interaction.member ? interaction.member.displayName : interaction.user.username,
                motif: channel.name.split('-')[0] || 'Dossier',
                messages: formattedMessages
            };

            await axios.post('https://bcso-noface.up.railway.app/api/tickets/transcript', payload);
            
            await interaction.editReply({ content: "✅ Dossier archivé sur le MDT avec succès. Suppression dans 3s..." });

            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur de clôture:", error);
            await interaction.channel.send("⚠️ **Alerte Serveur Central :** Impossible de synchroniser avec le MDT web. Suppression annulée.");
            await interaction.editReply({ content: "❌ Échec de la fermeture." }).catch(() => {});
        }
    });
};