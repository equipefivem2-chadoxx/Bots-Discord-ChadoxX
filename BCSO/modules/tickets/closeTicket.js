const { AttachmentBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'close_op_ticket') return;

        // Réponse immédiate pour éviter le timeout
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            const archiveChannel = interaction.guild.channels.cache.get(config.archiveChannelId);

            if (!archiveChannel) {
                return interaction.editReply({ content: "❌ Salon d'archive introuvable." });
            }

            // Génération du transcript avec inlineThreads: true
            // Cela force l'affichage de tous les messages des fils dans la page principale
            const transcript = await discordTranscripts.createTranscript(channel, {
                limit: -1,
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true,
                poweredBy: false,
                includeThreads: true,
                inlineThreads: true // 👈 C'est la clé : tout est affiché, rien à cliquer !
            });

            // Envoi de l'archive
            await archiveChannel.send({
                content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>`,
                files: [transcript]
            });

            await interaction.editReply({ content: "✅ Dossier archivé et fusionné avec succès. Suppression du salon dans 3s..." });

            // Suppression différée
            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur lors de la suppression du salon:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur critique lors de l'archivage:", error);
            await interaction.editReply({ 
                content: "❌ Erreur lors de l'archivage. Vérifie que le bot a bien les permissions de lire les messages et de supprimer les salons." 
            }).catch(() => {});
        }
    });
};