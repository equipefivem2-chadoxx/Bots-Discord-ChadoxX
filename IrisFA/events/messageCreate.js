const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message, client) {
        // --- 🛡️ SÉCURITÉ ---
        // 1. On ignore les bots
        // 2. On ignore les Slash Commands (pour pas qu'elles s'exécutent deux fois)
        if (message.author.bot || message.interaction) return;

        const prefix = "!"; // Ton préfixe

        // Si le message ne commence pas par !, on ne fait rien
        if (!message.content.startsWith(prefix)) return;

        // --- ⚙️ RÉCUPÉRATION DE LA COMMANDE ---
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        // Si la commande n'existe pas dans tes fichiers, on s'arrête
        if (!command) return;

        // --- 🚀 EXÉCUTION ---
        try {
            // On vérifie que c'est bien une commande classique (qui n'a pas de .data)
            // car les Slash Commands s'exécutent via interactionCreate
            if (!command.data) {
                command.execute(message, args, client);
            }
        } catch (error) {
            console.error(`❌ Erreur sur la commande !${commandName} :`, error);
        }
    },
};