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

            // Génération du transcript HTML (avec les fils et les images intégrées)
            const attachment = await discordTranscripts.createTranscript(channel, {
                limit: -1, // -1 = tout récupérer
                returnBuffer: false,
                filename: `${channel.name}.html`,
                saveImages: true, // ⚠️ C'est ça qui garantit que les images ne meurent jamais
                poweredBy: false,
                includeThreads: true
            });

            // Envoi dans les archives
            await archiveChannel.send({
                content: `📁 **Archive du dossier :** ${channel.name}\nFermé par : <@${interaction.user.id}>`,
                files: [attachment]
            });

            await interaction.editReply({ content: "✅ Transcript généré et archivé. Suppression du salon..." });

            setTimeout(() => {
                channel.delete().catch(console.error);
            }, 3000);

        } catch (error) {
            console.error("Erreur transcript:", error);
            await interaction.editReply({ content: "❌ Erreur lors de l'archivage." });
        }
    });
};