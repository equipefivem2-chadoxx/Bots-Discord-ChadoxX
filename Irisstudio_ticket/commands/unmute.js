const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Rend la parole à un membre (retire le rôle Mute).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('Le membre à démute')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('membre');
        const muteRoleId = '1517114538875555870';

        if (!targetUser) {
            return interaction.reply({ content: "❌ Membre introuvable sur le serveur.", ephemeral: true });
        }

        try {
            await targetUser.roles.remove(muteRoleId);
            
            const unmuteEmbed = new EmbedBuilder()
                .setColor('#00e5ff') // Cyan pour une action positive
                .setTitle('🔊 Membre Démute')
                .addFields(
                    { name: 'Membre', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [unmuteEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite. Vérifie que mon rôle de bot est bien au-dessus du rôle Mute.", ephemeral: true });
        }
    }
};