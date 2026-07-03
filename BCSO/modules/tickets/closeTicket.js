const { AttachmentBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'close_op_ticket') return;

        // 1. Réponse immédiate pour éviter l'échec d'interaction
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            const archiveChannel = interaction.guild.channels.cache.get(config.archiveChannelId);

            if (!archiveChannel) {
                return interaction.editReply({ content: "❌ Salon d'archive introuvable." });
            }

            // 2. Génération du transcript
            // On s'assure de passer un objet AttachmentBuilder correct
            const transcript = await discordTranscripts.createTranscript(channel, {
                limit: -1,
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true,
                poweredBy: false,
                includeThreads: true
            });

            // 3. Envoi dans les archives
            await archiveChannel.send({
                content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>`,
                files: [transcript]
            });

            // 4. Feedback final
            await interaction.editReply({ content: "✅ Transcript généré et archivé. Suppression du salon dans 3s..." });

            // 5. Suppression retardée
            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur transcript:", error);
            // Si on a déjà répondu, on utilise followUp, sinon editReply
            await interaction.editReply({ content: "❌ Erreur lors de l'archivage. Vérifie les logs du bot." }).catch(() => {});
        }
    });
};