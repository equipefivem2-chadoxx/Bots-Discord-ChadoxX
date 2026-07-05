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

        // 👇 NOUVEAU : On récupère le salon spécifique
        const targetChannelId = '1427848018698440764';
        const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

        // Sécurité : on vérifie que le salon existe bien
        if (!targetChannel) {
            return interaction.reply({ 
                content: `❌ Impossible de trouver le salon cible (ID: ${targetChannelId}). Assure-toi que le bot y a accès.`, 
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

        // 👇 NOUVEAU : On envoie le panel dans le salon cible au lieu du salon actuel
        await targetChannel.send({ embeds: [embed], components: [row] });
        
        // Réponse invisible pour confirmer que ça a marché, avec mention du salon
        await interaction.reply({ 
            content: `✅ Panel généré avec succès dans le salon ${targetChannel}.`, 
            ephemeral: true 
        });
    }
};