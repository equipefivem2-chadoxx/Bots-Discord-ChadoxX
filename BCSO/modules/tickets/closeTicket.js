const { EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        // On vérifie que c'est bien le bouton de fermeture
        if (!interaction.isButton() || interaction.customId !== 'close_op_ticket') return;

        // On fait patienter l'API car l'aspiration des fils peut prendre quelques secondes
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            const archiveChannel = interaction.guild.channels.cache.get(config.archiveChannelId);

            if (!archiveChannel) {
                return interaction.editReply({ content: "❌ Le salon d'archive est introuvable. Vérifie l'ID dans config.js." });
            }

            await interaction.editReply({ content: "⏳ Archivage en cours... Aspiration des fils et des preuves..." });

            // 1. Récupération des messages du salon principal
            const mainMessages = await channel.messages.fetch({ limit: 100 });
            let allMessages = Array.from(mainMessages.values());

            // 2. Récupération de TOUS les fils (threads) du salon
            const fetchedThreads = await channel.threads.fetch();
            for (const [threadId, thread] of fetchedThreads.threads) {
                const threadMessages = await thread.messages.fetch({ limit: 100 });
                // On ajoute les messages des fils à notre liste globale
                allMessages = allMessages.concat(Array.from(threadMessages.values()));
            }

            // 3. Extraction de toutes les images
            const attachmentsToSend = [];
            
            // On trie les messages du plus vieux au plus récent pour garder un ordre chronologique
            allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            for (const msg of allMessages) {
                if (msg.attachments.size > 0) {
                    msg.attachments.forEach(attachment => {
                        // On vérifie que c'est bien une image (jpg, png, etc.)
                        if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                            attachmentsToSend.push(attachment.url);
                        }
                    });
                }
            }

            // 4. Création de l'Embed de résumé pour les archives
            const archiveEmbed = new EmbedBuilder()
                .setAuthor({ name: "🚓 ARCHIVE - BUREAU DES OPÉRATIONS" })
                .setTitle(`Dossier : ${channel.name}`)
                .setDescription(`**Fermé par :** <@${interaction.user.id}>\n**Preuves photographiques récupérées :** ${attachmentsToSend.length}`)
                .setColor(config.embedColor)
                .setTimestamp();

            // On envoie l'entête dans le salon d'archive
            await archiveChannel.send({ embeds: [archiveEmbed] });

            // 5. Envoi des images dans l'archive
            if (attachmentsToSend.length > 0) {
                // Discord limite l'envoi à 10 fichiers par message, on fait donc des paquets de 10
                for (let i = 0; i < attachmentsToSend.length; i += 10) {
                    const chunk = attachmentsToSend.slice(i, i + 10);
                    // Le bot upload les images dans l'archive, elles deviennent permanentes
                    await archiveChannel.send({ files: chunk });
                }
            }

            // 6. Suppression du salon
            await interaction.editReply({ content: "✅ Archivage terminé avec succès. Suppression du dossier dans 5 secondes..." });

            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 5000);

        } catch (error) {
            console.error("❌ ERREUR FERMETURE TICKET :", error);
            await interaction.editReply({ content: `❌ Une erreur est survenue pendant la sauvegarde des preuves.` });
        }
    });
};