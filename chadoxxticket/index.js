const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
// Import du fichier tokens situé à la racine
const tokens = require('../tokens.js'); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.commandArray = [];

const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

for (const file of handlerFiles) {
    require(path.join(handlersPath, file))(client);
}

// CORRIGÉ : Utilisation de l'objet tokens importé
client.login(tokens.TOKEN_CHADOXX);