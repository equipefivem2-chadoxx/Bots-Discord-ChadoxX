const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Place un utilisateur sur liste noire (Ban/Blacklist).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('Le membre à blacklist')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison de la blacklist')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const blacklistRoleId = '1517114539559223437';

        if (!targetUser) {
            return interaction.reply({ content: "❌ Membre introuvable.", ephemeral: true });
        }

        if (!targetUser.manageable) {
            return interaction.reply({ content: "❌ Je n'ai pas les permissions pour blacklist ce membre.", ephemeral: true });
        }

        try {
            await targetUser.roles.add(blacklistRoleId);
            
            const banEmbed = new EmbedBuilder()
                .setColor('#ff0000') // Rouge pour la blacklist
                .setTitle('🚫 Membre mis sur Liste Noire')
                .addFields(
                    { name: 'Membre', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [banEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors de l'ajout du rôle Blacklist.", ephemeral: true });
        }
    }
};