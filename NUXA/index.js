const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Autorise le bot à voir les membres (indispensable pour la bienvenue)
    ]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Chargement des handlers (Système modulaire)
require('./src/handlers/eventHandler')(client);
require('./src/handlers/commandHandler')(client);

// Connexion du bot
client.login(process.env.DISCORD_TOKEN);