module.exports = {
    name: 'messageCreate',
    once: false,
    execute(message, client) {
        const PREFIX = '!';

        // Si le message ne commence pas par ! ou si c'est un autre bot qui parle, on ignore
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        // On sépare la commande des arguments
        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // On cherche la commande dans la collection
        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            // On exécute la commande !
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply("❌ Une erreur s'est produite lors de l'exécution de cette commande.");
        }
    },
};