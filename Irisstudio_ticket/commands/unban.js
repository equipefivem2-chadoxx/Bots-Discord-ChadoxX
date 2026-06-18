const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannit définitivement un utilisateur du serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option => 
            option.setName('id')
                .setDescription('L\'ID (chiffres) de l\'utilisateur à débannir')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.options.getString('id');

        try {
            // Demande à l'API de Discord de retirer le ban
            await interaction.guild.members.unban(userId);
            
            const unbanEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔓 Utilisateur Débanni')
                .addFields(
                    { name: 'ID Utilisateur', value: `\`${userId}\``, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [unbanEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Impossible de débannir cet utilisateur. Vérifie que l'ID est correct et qu'il est bien banni actuellement.", ephemeral: true });
        }
    }
};