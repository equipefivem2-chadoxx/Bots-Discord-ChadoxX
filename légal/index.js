const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Events } = require('discord.js');

// 🔄 Chargement "intelligent" : local (tokens.js) ou Railway (process.env)
const tokensPath = path.join(__dirname, '../tokens.js');
const tokens = fs.existsSync(tokensPath) ? require(tokensPath) : process.env;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Ready
client.once(Events.ClientReady, (c) => {
    console.log(`[LEGAL] ${c.user.tag} connecté`);
});

// Anti-crash basique
process.on('unhandledRejection', (err) => {
    console.error('[LEGAL] Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('[LEGAL] Uncaught Exception:', err);
});

// Connexion sécurisée avec vérification
const loginToken = tokens.TOKEN_LEGAL || process.env.TOKEN_LEGAL;

if (loginToken) {
    client.login(loginToken);
} else {
    console.error("❌ ERREUR FATALE : Token LÉGAL introuvable.");
}