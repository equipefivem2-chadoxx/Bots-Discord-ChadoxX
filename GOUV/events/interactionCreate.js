module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        // On ne gère ici QUE les commandes Slash (/)
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Une erreur est survenue lors de l\'exécution !', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exécution !', ephemeral: true });
            }
        }
    },
};