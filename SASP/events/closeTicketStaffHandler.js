const { Events, PermissionFlagsBits } = require('discord.js');
const audit = require('./auditLogs'); // Import du module de log

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket_staff') return;

        // ✨ LOG DE FERMETURE
        audit.sendAuditLog(interaction.client, 'CLOSE', {
            user: `<@${interaction.user.id}>`,
            channelName: interaction.channel.name,
            action: 'Fermeture de ticket Staff'
        });

        await interaction.reply("🔒 Fermeture du ticket dans 5 secondes...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
};