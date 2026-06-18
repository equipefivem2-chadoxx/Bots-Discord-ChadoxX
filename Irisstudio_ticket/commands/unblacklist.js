const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklist')
        .setDescription('Retire un membre de la liste noire.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('Le membre à retirer de la blacklist')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('membre');
        const blacklistRoleId = '1517114539559223437';

        if (!targetUser) {
            return interaction.reply({ content: "❌ Membre introuvable sur le serveur.", ephemeral: true });
        }

        try {
            await targetUser.roles.remove(blacklistRoleId);
            
            const unblacklistEmbed = new EmbedBuilder()
                .setColor('#00ff00') // Vert pour valider le retour
                .setTitle('✅ Membre retiré de la Liste Noire')
                .addFields(
                    { name: 'Membre', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [unblacklistEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors du retrait du rôle Blacklist.", ephemeral: true });
        }
    }
};