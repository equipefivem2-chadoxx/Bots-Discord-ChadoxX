const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // On vérifie qu'il s'agit bien de notre bouton de fermeture
        if (!interaction.isButton() || interaction.customId !== 'close_ticket') return;

        const staffRoleId = '1516530361511710730';

        // 1. Vérification des permissions
        if (!interaction.member.roles.cache.has(staffRoleId)) {
            return interaction.reply({ 
                content: "❌ Seul un membre du staff peut fermer ce ticket.", 
                ephemeral: true 
            });
        }

        // 2. Action de fermeture
        await interaction.reply({ content: "🔒 Le ticket sera supprimé dans 5 secondes..." });

        // Suppression du salon après 5 secondes
        setTimeout(() => {
            interaction.channel.delete().catch(console.error);
        }, 5000);
    }
};