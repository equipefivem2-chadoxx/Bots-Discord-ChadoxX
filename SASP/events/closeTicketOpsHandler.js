const { Events, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'close_ticket_ops') return;

        // On vérifie que la personne a les droits de gérer le salon
        if (!interaction.member.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: "❌ Seul un administrateur ou le propriétaire du ticket peut le fermer.", ephemeral: true });
        }

        await interaction.reply({ 
            content: "⚠️ **Rappel :** Avez-vous bien pensé à faire un `!transcript` pour l'archive avant de fermer ?\n\nCe dossier sera définitivement supprimé dans 5 secondes...", 
            ephemeral: false 
        });

        // Suppression du salon après 5 secondes
        setTimeout(() => {
            interaction.channel.delete().catch(err => console.error("Impossible de supprimer le ticket :", err));
        }, 5000);
    }
};