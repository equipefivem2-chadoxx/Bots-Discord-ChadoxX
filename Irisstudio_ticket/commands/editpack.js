const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editpack')
        .setDescription('Modifie un pack graphique déjà publié.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option => 
            option.setName('salon')
                .setDescription('Le salon où se trouve le pack à modifier')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('message_id')
                .setDescription('L\'ID du message du pack à modifier')
                .setRequired(true)
        )
        // Toutes les options suivantes sont FACULTATIVES (non requises)
        .addStringOption(option => 
            option.setName('titre')
                .setDescription('Nouveau titre (laisse vide pour ne pas changer)')
                .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('preview')
                .setDescription('Nouveau lien YouTube (laisse vide pour ne pas changer)')
                .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('download')
                .setDescription('Nouveau lien de téléchargement (laisse vide pour ne pas changer)')
                .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('image')
                .setDescription('Nouveau lien de l\'image (laisse vide pour ne pas changer)')
                .setRequired(false)
        ),

    async execute(interaction) {
        // 1. Récupération des infos de base
        const targetChannel = interaction.options.getChannel('salon');
        const messageId = interaction.options.getString('message_id');

        // Récupération des options facultatives
        const newTitre = interaction.options.getString('titre');
        const newPreview = interaction.options.getString('preview');
        const newDownload = interaction.options.getString('download');
        const newImage = interaction.options.getString('image');

        await interaction.deferReply({ ephemeral: true }); // Fait patienter Discord

        try {
            // 2. On va chercher le message exact dans le salon
            const message = await targetChannel.messages.fetch(messageId);

            if (!message) {
                return interaction.editReply({ content: "❌ Message introuvable. Vérifie l'ID du message et le salon." });
            }

            // On vérifie que c'est bien un embed
            const oldEmbed = message.embeds[0];
            if (!oldEmbed) {
                return interaction.editReply({ content: "❌ Ce message ne contient aucun embed de pack." });
            }

            // 3. Extraction des anciens liens depuis la description actuelle
            const oldDesc = oldEmbed.description || '';
            const previewMatch = oldDesc.match(/\[Voir la vidéo Preview\]\((.*?)\)/);
            const downloadMatch = oldDesc.match(/\[Télécharger le pack ici\]\((.*?)\)/);

            const oldPreviewUrl = previewMatch ? previewMatch[1] : '#';
            const oldDownloadUrl = downloadMatch ? downloadMatch[1] : '#';

            // 4. Construction du nouvel embed en gardant les anciennes valeurs si on n'a rien rempli de nouveau
            const finalPreview = newPreview || oldPreviewUrl;
            const finalDownload = newDownload || oldDownloadUrl;

            const updatedEmbed = EmbedBuilder.from(oldEmbed)
                .setDescription(`> 🎥 **[Voir la vidéo Preview](${finalPreview})**\n> \n> ⬇️ **[Télécharger le pack ici](${finalDownload})**`);

            if (newTitre) updatedEmbed.setTitle(newTitre.toUpperCase());
            if (newImage) updatedEmbed.setImage(newImage);

            // 5. Mise à jour du message
            await message.edit({ embeds: [updatedEmbed] });
            await interaction.editReply({ content: `✅ Le pack a été modifié avec succès ! [Clique ici pour le voir](${message.url})` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "❌ Une erreur s'est produite. L'ID du message est-il correct ?" });
        }
    }
};