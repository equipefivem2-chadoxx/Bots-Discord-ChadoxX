const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createpack')
        .setDescription('Publie un nouveau pack graphique avec un design propre.')
        // Limite l'utilisation au staff (ceux qui peuvent gérer les messages)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option => 
            option.setName('titre')
                .setDescription('Le titre du pack (ex: PACK FANA V3/V2 | FIVEM)')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('preview')
                .setDescription('Lien de la vidéo YouTube (Preview)')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('download')
                .setDescription('Lien de téléchargement du pack')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('image')
                .setDescription('Lien de l\'image de présentation (URL Discord, Imgur, etc.)')
                .setRequired(true)
        )
        .addChannelOption(option => 
            option.setName('salon')
                .setDescription('Le salon où publier l\'embed')
                // Restreint la sélection aux salons textuels et d'annonces
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)
        ),
        
    async execute(interaction) {
        // 1. Récupération des informations tapées par l'utilisateur
        const titre = interaction.options.getString('titre');
        const previewUrl = interaction.options.getString('preview');
        const downloadUrl = interaction.options.getString('download');
        const imageUrl = interaction.options.getString('image');
        const targetChannel = interaction.options.getChannel('salon');

        // 2. Création de l'Embed (Fidèle à ton screen)
        const cyanColor = '#00e5ff'; // La couleur cyan sur le bord gauche de ton screen
        
        const packEmbed = new EmbedBuilder()
            .setColor(cyanColor)
            .setTitle(titre.toUpperCase()) // Force le titre en majuscules pour le style
            .setThumbnail(interaction.guild.iconURL()) // Met le logo du serveur en haut à droite
            // Utilise la syntaxe Markdown de Discord pour faire des liens cliquables discrets
            .setDescription(`[Preview](${previewUrl})\n\n[download](${downloadUrl})`)
            .setImage(imageUrl); // La grande image en bas

        // 3. Envoi de l'embed dans le salon cible
        try {
            await targetChannel.send({ embeds: [packEmbed] });
            
            // Message de confirmation invisible pour celui qui a tapé la commande
            await interaction.reply({ content: `✅ Le pack **${titre}** a été publié avec succès dans <#${targetChannel.id}> !`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur est survenue lors de l'envoi. Vérifie que j'ai bien les permissions de parler dans ce salon.", ephemeral: true });
        }
    }
};