const { Client, GatewayIntentBits, Events } = require('discord.js');

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

// CORRIGÉ : Utilisation de TOKEN_légal
client.login(process.env.TOKEN_légal);