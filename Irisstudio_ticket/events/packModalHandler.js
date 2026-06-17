const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // On écoute uniquement la validation de notre formulaire
        if (!interaction.isModalSubmit() || interaction.customId !== 'submit_pack_form') return;

        // 1. Récupération des données du formulaire
        const titre = interaction.fields.getTextInputValue('pack_titre');
        const previewUrl = interaction.fields.getTextInputValue('pack_preview');
        const downloadUrl = interaction.fields.getTextInputValue('pack_download');
        const imageUrl = interaction.fields.getTextInputValue('pack_image');
        const targetChannelId = interaction.fields.getTextInputValue('pack_channel');

        // 2. Vérification du salon
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);
        if (!targetChannel) {
            return interaction.reply({ content: `❌ Impossible de trouver le salon avec l'ID \`${targetChannelId}\`. L'envoi a été annulé.`, ephemeral: true });
        }

        // 3. Création de l'Embed final
        const cyanColor = '#00e5ff';
        const packEmbed = new EmbedBuilder()
            .setColor(cyanColor)
            .setTitle(titre.toUpperCase())
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(`[Preview](${previewUrl})\n\n[download](${downloadUrl})`)
            .setImage(imageUrl);

        // 4. Envoi
        try {
            await targetChannel.send({ embeds: [packEmbed] });
            await interaction.reply({ content: `✅ Le pack **${titre}** a été publié avec succès dans <#${targetChannelId}> !`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors de la publication. Vérifie mes permissions dans le salon cible.", ephemeral: true });
        }
    }
};