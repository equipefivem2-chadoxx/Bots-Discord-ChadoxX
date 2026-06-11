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
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.commandArray = [];

const handlersPath = path.join(__dirname, 'handlers');
// Sécurité : on vérifie que le dossier existe avant de le lire
if (fs.existsSync(handlersPath)) {
    const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
    for (const file of handlerFiles) {
        require(path.join(handlersPath, file))(client);
    }
}

// Utilisation dynamique : il cherchera TOKEN_CHADOXX dans tokens.js (local) 
// ou dans les Variables Railway (serveur)
const loginToken = tokens.TOKEN_CHADOXX || process.env.TOKEN_CHADOXX;

if (!loginToken) {
    console.error("❌ ERREUR FATALE : Aucun token trouvé pour ChadoxX !");
    process.exit(1);
}

client.login(loginToken);