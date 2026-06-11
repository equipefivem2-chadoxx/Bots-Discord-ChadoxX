const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`[ChadoxXTICKET] Commande ${interaction.commandName} introuvable.`);
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`[ChadoxXTICKET] Erreur sur la commande ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Une erreur est survenue avec cette commande ticket.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Une erreur est survenue avec cette commande ticket.', ephemeral: true });
            }
        }
    },
};