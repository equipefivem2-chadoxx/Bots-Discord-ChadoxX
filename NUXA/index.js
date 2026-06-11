const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 🔄 Chargement "intelligent" : local (tokens.js) ou Railway (process.env)
const tokensPath = path.join(__dirname, '../tokens.js');
const tokens = fs.existsSync(tokensPath) ? require(tokensPath) : process.env;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

client.commands = new Collection();

// Chargement des handlers
require('./src/handlers/eventHandler')(client);
require('./src/handlers/commandHandler')(client);

// 🛡️ Connexion sécurisée
const loginToken = tokens.TOKEN_NUXA || process.env.TOKEN_NUXA;

if (loginToken) {
    client.login(loginToken);
} else {
    console.error("❌ ERREUR FATALE : Token NUXA introuvable !");
}