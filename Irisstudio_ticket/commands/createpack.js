const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createpack')
        .setDescription('Envoie le panel de gestion pour créer un pack graphique.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const targetChannelId = '1516750913086292039';
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.reply({ content: "❌ Le salon cible est introuvable. Vérifie l'ID.", ephemeral: true });
        }

        // --- DESIGN PANEL ÉPURÉ ---
        // Une couleur de fond sombre pour que l'embed se fonde dans Discord
        const panelEmbed = new EmbedBuilder()
            .setColor('#2b2d31') 
            .setAuthor({ name: "Iris'Studio | Création de Packs", iconURL: interaction.guild.iconURL() })
            .setDescription("> 🛠️ *Cet outil permet de générer et publier des packs graphiques de manière standardisée.*\n\nCliquez sur le bouton ci-dessous pour remplir les informations du nouveau pack.")
            .setFooter({ text: "Outil Staff Réservé" });

        const button = new ButtonBuilder()
            .setCustomId('open_pack_form')
            .setLabel('Publier un Pack')
            .setEmoji('📦')
            .setStyle(ButtonStyle.Secondary); // Bouton gris pour un look plus pro et discret

        const row = new ActionRowBuilder().addComponents(button);

        await targetChannel.send({ embeds: [panelEmbed], components: [row] });
        await interaction.reply({ content: `✅ Panel de création envoyé avec succès dans <#${targetChannelId}> !`, ephemeral: true });
    }
};