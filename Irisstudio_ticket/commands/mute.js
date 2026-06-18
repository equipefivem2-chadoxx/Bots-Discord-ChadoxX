const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Rend un utilisateur muet sur le serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles) // Réservé au staff
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('Le membre à rendre muet')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison du mute')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const muteRoleId = '1517114538875555870';

        if (!targetUser) {
            return interaction.reply({ content: "❌ Membre introuvable.", ephemeral: true });
        }

        // Vérification si le bot peut modifier ce membre
        if (!targetUser.manageable) {
            return interaction.reply({ content: "❌ Je n'ai pas les permissions pour mute ce membre (son rôle est peut-être supérieur au mien).", ephemeral: true });
        }

        try {
            await targetUser.roles.add(muteRoleId);
            
            const muteEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('🔇 Membre Rendu Muet')
                .addFields(
                    { name: 'Membre', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [muteEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors de l'ajout du rôle Mute.", ephemeral: true });
        }
    }
};