const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // On ignore les autres bots
        if (message.author.bot) return;

        // On vérifie que ça commence par "!"
        if (!message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Le bot cherche la commande dans sa mémoire
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de !${commandName} :`, error);
        }
    },
};