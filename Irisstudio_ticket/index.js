const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers // <-- AJOUT DE CETTE LIGNE OBLIGATOIRE ICI
    ]
});

// ----------------------------------------------------
// NOUVEAU : Système de chargement modulaire des commandes
// ----------------------------------------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        // Vérifie que le fichier a bien la bonne structure
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[AVERTISSEMENT] La commande à ${filePath} n'a pas les propriétés "data" ou "execute".`);
        }
    }
}

// ----------------------------------------------------
// EXISTANT : Système de chargement modulaire des événements
// ----------------------------------------------------
const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// Connexion du bot
client.login(config.token);