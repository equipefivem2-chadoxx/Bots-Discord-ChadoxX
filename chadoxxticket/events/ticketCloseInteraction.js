const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'close_ticket') return;

        const staffRoleId = '1503490205276045433';

        // VERIFICATION : Est-ce que l'utilisateur a le rôle Staff ou la permission Administrateur ?
        if (!interaction.member.roles.cache.has(staffRoleId) && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ 
                content: '❌ **Action refusée :** Vous n\'avez pas la permission de fermer ce ticket. Un membre du staff s\'en chargera.', 
                ephemeral: true 
            });
        }

        // Si c'est bien le staff, on ferme
        await interaction.reply({ content: '🔒 Fermeture du ticket en cours...', ephemeral: true });

        try {
            await interaction.channel.delete();
        } catch (error) {
            console.error("Erreur lors de la suppression du ticket :", error);
            await interaction.editReply({ content: "❌ Impossible de fermer le ticket." });
        }
    },
};