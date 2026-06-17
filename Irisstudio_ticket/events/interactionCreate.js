const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // Si l'interaction n'est pas une commande Slash (/), on ignore
        if (!interaction.isChatInputCommand()) return;

        // Va chercher la commande correspondante dans notre Collection
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Aucune commande /${interaction.commandName} n'a été trouvée.`);
            return;
        }

        // Tente d'exécuter la commande
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`);
            console.error(error);
            
            // Réponse d'erreur pour l'utilisateur
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
            }
        }
    },
};