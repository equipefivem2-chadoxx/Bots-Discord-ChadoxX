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

            await interaction.editReply({ content: "⏳ Fusion des fils et création de l'archive unique en cours..." });

            // 1. Tableau qui va contenir absolument TOUS les messages
            let allMessages = [];

            // 2. On aspire les messages du salon principal
            const mainMessages = await channel.messages.fetch({ limit: 100 });
            allMessages.push(...mainMessages.values());

            // 3. On aspire les messages de CHAQUE fil ouvert
            const fetchedThreads = await channel.threads.fetch();
            for (const [threadId, thread] of fetchedThreads.threads) {
                const threadMessages = await thread.messages.fetch({ limit: 100 });
                allMessages.push(...threadMessages.values());
            }

            // 4. On trie le tout par ordre chronologique (du plus vieux au plus récent)
            allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            // 5. On utilise "generateFromMessages" au lieu de "createTranscript"
            // Cela force le module à créer une page simple avec tous nos messages fusionnés
            const transcript = await discordTranscripts.generateFromMessages(allMessages, channel, {
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true,
                poweredBy: false
            });

            // 6. Envoi de l'archive unique
            await archiveChannel.send({
                content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>\n*Tous les fils ont été fusionnés chronologiquement dans ce fichier.*`,
                files: [transcript]
            });

            await interaction.editReply({ content: "✅ Dossier archivé avec succès (1 seul fichier). Suppression dans 3s..." });

            // 7. Suppression du salon
            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur transcript complet:", error);
            await interaction.editReply({ content: "❌ Erreur lors de l'archivage complet." }).catch(() => {});
        }
    });
};