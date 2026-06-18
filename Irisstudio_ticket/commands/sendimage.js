const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendimage')
        .setDescription('Fait envoyer une image par le bot dans un salon spécifique.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option => 
            option.setName('salon')
                .setDescription('Le salon où envoyer l\'image')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('lien')
                .setDescription('L\'URL de ton image (Lien Discord, Imgur, etc.)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('salon');
        const imageUrl = interaction.options.getString('lien');

        // Création d'un embed ultra minimaliste pour mettre l'image en valeur
        const imageEmbed = new EmbedBuilder()
            .setColor('#d4af37') // La couleur Or de Iris'Studio pour rester dans le thème
            .setImage(imageUrl);

        try {
            await targetChannel.send({ embeds: [imageEmbed] });
            
            // Message de confirmation invisible pour le staff
            await interaction.reply({ content: `✅ L'image a été publiée avec succès dans <#${targetChannel.id}> !`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite. Vérifie que le lien de l'image est valide et que j'ai la permission de parler dans ce salon.", ephemeral: true });
        }
    }
};