const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isModalSubmit() || interaction.customId !== 'submit_pack_form') return;

        const titre = interaction.fields.getTextInputValue('pack_titre');
        const previewUrl = interaction.fields.getTextInputValue('pack_preview');
        const downloadUrl = interaction.fields.getTextInputValue('pack_download');
        const imageUrl = interaction.fields.getTextInputValue('pack_image');
        const targetChannelId = interaction.fields.getTextInputValue('pack_channel');

        const targetChannel = interaction.client.channels.cache.get(targetChannelId);
        if (!targetChannel) {
            return interaction.reply({ content: `❌ Impossible de trouver le salon avec l'ID \`${targetChannelId}\`. L'envoi a été annulé.`, ephemeral: true });
        }

        // --- DESIGN PREMIUM ÉPURÉ (Sans l'en-tête Author) ---
        const cyanColor = '#00e5ff'; 
        
        const packEmbed = new EmbedBuilder()
            .setColor(cyanColor)
            .setTitle(titre.toUpperCase()) // Le titre apparaît tout en haut directement
            .setDescription(`> 🎥 **[Voir la vidéo Preview](${previewUrl})**\n> \n> ⬇️ **[Télécharger le pack ici](${downloadUrl})**`)
            .setImage(imageUrl)
            .setFooter({ text: "Iris'Studio", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        try {
            await targetChannel.send({ embeds: [packEmbed] });
            await interaction.reply({ content: `✅ Le pack **${titre}** a été publié avec succès dans <#${targetChannelId}> !`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors de la publication. Vérifie mes permissions dans le salon cible.", ephemeral: true });
        }
    }
};