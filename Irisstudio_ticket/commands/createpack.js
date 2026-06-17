const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createpack')
        .setDescription('Envoie le panel de gestion pour créer un pack graphique.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        // Le salon cible que tu as demandé
        const targetChannelId = '1516750913086292039';
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.reply({ content: "❌ Le salon cible est introuvable. Vérifie l'ID.", ephemeral: true });
        }

        // Création de l'embed du panel Staff
        const panelEmbed = new EmbedBuilder()
            .setColor('#00e5ff')
            .setTitle('📦 Outil de Publication : Packs Graphiques')
            .setDescription('Clique sur le bouton ci-dessous pour ouvrir le formulaire de création et publier un nouveau pack sur le serveur.')
            .setThumbnail(interaction.guild.iconURL());

        // Le bouton qui va déclencher le formulaire
        const button = new ButtonBuilder()
            .setCustomId('open_pack_form')
            .setLabel('Créer un Pack')
            .setEmoji('🎨')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        // Envoi dans le salon spécifique
        await targetChannel.send({ embeds: [panelEmbed], components: [row] });
        await interaction.reply({ content: `✅ Panel de création envoyé avec succès dans <#${targetChannelId}> !`, ephemeral: true });
    }
};