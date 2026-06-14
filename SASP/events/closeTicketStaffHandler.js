const { Events, PermissionFlagsBits } = require('discord.js');
const audit = require('./auditLogs'); // Import du module de log

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket_staff') return;

        // ✨ LOG DE FERMETURE (Salon de logs)
        audit.sendAuditLog(interaction.client, 'CLOSE', {
            user: `<@${interaction.user.id}>`,
            channelName: interaction.channel.name,
            action: 'Fermeture de ticket Staff'
        });

        // ✨ SAUVEGARDE DB (Historique JSON)
        audit.saveTicket(
            interaction.user.id, 
            interaction.user.username, 
            interaction.channel.name, 
            'FERMETURE'
        );

        await interaction.reply("🔒 Fermeture du ticket dans 5 secondes...");
        
        // Suppression du salon après 5 secondes
        setTimeout(() => {
            interaction.channel.delete().catch(err => {
                console.error("Erreur lors de la suppression du ticket :", err);
            });
        }, 5000);
    }
};