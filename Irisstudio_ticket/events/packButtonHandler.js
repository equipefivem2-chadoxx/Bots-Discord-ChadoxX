const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // Si ce n'est pas notre bouton de création de pack, on ignore
        if (!interaction.isButton() || interaction.customId !== 'open_pack_form') return;

        // Création du formulaire (Modal)
        const modal = new ModalBuilder()
            .setCustomId('submit_pack_form')
            .setTitle('Nouveau Pack Graphique');

        // Question 1 : Titre
        const titreInput = new TextInputBuilder()
            .setCustomId('pack_titre')
            .setLabel('Titre du pack')
            .setPlaceholder('Ex: PACK FANA V3/V2 | FIVEM')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Question 2 : YouTube
        const previewInput = new TextInputBuilder()
            .setCustomId('pack_preview')
            .setLabel('Lien de la vidéo Preview (YouTube)')
            .setPlaceholder('https://youtube.com/...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Question 3 : Download
        const downloadInput = new TextInputBuilder()
            .setCustomId('pack_download')
            .setLabel('Lien de Téléchargement')
            .setPlaceholder('https://mega.nz/...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Question 4 : Image
        const imageInput = new TextInputBuilder()
            .setCustomId('pack_image')
            .setLabel("Lien de l'image d'illustration")
            .setPlaceholder('URL Discord, Imgur...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Question 5 : Salon cible
        const channelInput = new TextInputBuilder()
            .setCustomId('pack_channel')
            .setLabel("ID du salon où publier l'embed")
            .setPlaceholder('Ex: 1516531376436940910')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // On assemble tout (Discord exige une ActionRow par question)
        modal.addComponents(
            new ActionRowBuilder().addComponents(titreInput),
            new ActionRowBuilder().addComponents(previewInput),
            new ActionRowBuilder().addComponents(downloadInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(channelInput)
        );

        // On affiche le formulaire à l'utilisateur
        await interaction.showModal(modal);
    }
};