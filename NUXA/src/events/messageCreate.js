const { Events, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// On crée une collection locale juste pour cet événement
const prefixCommands = new Collection();
const prefix = '!';

// Chargement automatique de tes commandes préfixées (100% modulaire)
const commandsPath = path.join(__dirname, '../prefixCommands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        prefixCommands.set(command.name, command);
    }
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        // Si le message ne commence pas par "!" ou vient d'un bot, on annule
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        // On découpe le message pour récupérer le nom de la commande
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // On cherche si la commande existe dans notre dossier
        const command = prefixCommands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.');
        }
    },
};