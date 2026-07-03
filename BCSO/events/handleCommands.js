module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        // Si l'interaction n'est pas une Slash Command, on ignore
        if (!interaction.isChatInputCommand()) return;

        // On récupère la commande dans la collection qu'on a créée
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ Aucune commande trouvée pour : ${interaction.commandName}`);
            return;
        }

        try {
            // On lance le fichier de la commande
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Erreur sur la commande ${interaction.commandName} :`, error);
            
            // Réponse de secours si le code crash
            const errorMessage = { content: "Il y a eu une erreur en exécutant cette commande !", ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    });
};