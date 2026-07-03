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

            // Génération forcée avec traitement des fils
            // Le paramètre 'inlineThreads' fusionne le contenu directement
            const transcript = await discordTranscripts.createTranscript(channel, {
                limit: -1,
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true,
                poweredBy: false,
                includeThreads: true,
                inlineThreads: true
            });

            // Envoi du fichier
            await archiveChannel.send({
                content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>`,
                files: [transcript]
            });

            await interaction.editReply({ 
                content: "✅ Dossier archivé. Tout l'historique (incluant les fils) est fusionné dans le fichier ci-dessus." 
            });

            // Suppression propre
            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression:", err));
            }, 3000);

        } catch (error) {
            console.error("❌ Erreur critique:", error);
            await interaction.editReply({ 
                content: "❌ Erreur lors de l'archivage. Assure-toi que le bot a accès à tous les fils." 
            }).catch(() => {});
        }
    });
};