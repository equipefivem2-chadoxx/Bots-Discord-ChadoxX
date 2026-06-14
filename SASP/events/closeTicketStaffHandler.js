const { Events, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket_staff') return;

        // Ici, tu peux ajouter une vérification pour que seuls les "Staff" cliquent
        await interaction.reply("🔒 Fermeture du ticket dans 5 secondes...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
};