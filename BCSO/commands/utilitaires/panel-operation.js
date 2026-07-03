const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-operation')
        .setDescription('Fait apparaître le panel pour ouvrir les dossiers d\'opération du BCSO.'),
        
    async execute(interaction, client) {
        // 🔒 Vérification : Est-ce que le membre possède un des deux rôles autorisés ?
        const hasRole = interaction.member.roles.cache.some(role => config.allowedRolesCommand.includes(role.id));
        
        // On autorise aussi les Administrateurs par défaut pour éviter de te bloquer
        if (!hasRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas les permissions nécessaires pour créer ce panel.", 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: "🚓 BUREAU DES OPÉRATIONS - BCSO" })
            .setTitle("Création d'un nouveau dossier d'opération")
            .setDescription("Cliquez sur le bouton ci-dessous pour ouvrir un dossier dédié à votre intervention.\n\n⚠️ *Tout abus d'ouverture de dossier sera sanctionné.*")
            .setColor(config.embedColor)
            .setThumbnail(config.logoUrl)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_op_ticket')
                .setLabel("Ouvrir dossier d'opération")
                .setEmoji('📁')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        
        // Réponse invisible pour confirmer que ça a marché
        await interaction.reply({ content: "✅ Panel généré avec succès.", ephemeral: true });
    }
};