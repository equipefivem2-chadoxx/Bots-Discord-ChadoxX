const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

// --- CHARGEMENT MODULAIRE DES COMMANDES ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        // ✨ Ajustement : Accepte les commandes Slash (data.name) ET les commandes Prefix (name)
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        } else if (command.name && command.execute) {
            client.commands.set(command.name, command);
        } else {
            console.log(`[ATTENTION] La commande ${file} manque une propriété "data"/"name" ou "execute".`);
        }
    }
}

// --- CHARGEMENT MODULAIRE DES ÉVÉNEMENTS ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// --- CONNEXION DU BOT ET LANCEMENT DES MODULES EXTERNES ---
client.login(config.token).then(() => {
    // ✨ INITIALISATION DE L'API POUR LE SITE WEB NETLIFY
    // Ce code s'exécute de façon 100% indépendante une fois le bot en ligne
    const apiPath = path.join(__dirname, 'api', 'server.js');
    if (fs.existsSync(apiPath)) {
        require(apiPath).init();
    }
}).catch(err => {
    console.error("[ERREUR] Impossible de connecter le bot :", err);
});