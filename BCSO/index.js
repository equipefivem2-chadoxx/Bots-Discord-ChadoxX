const { Client, GatewayIntentBits } = require('discord.js');

// Ton start.js transmet automatiquement les variables Railway !
const token = process.env.TOKEN_BCSO; 

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ] 
});

client.once('ready', () => {
    console.log(`✅ [Bot BCSO] Connecté avec succès en tant que ${client.user.tag}`);
});

if (!token) {
    console.error("❌ [Bot BCSO] CRASH : Le TOKEN_BCSO est introuvable sur Railway (ou dans ton .env) !");
    process.exit(1); // Fait crash le process pour que ton webhook IrisFA le signale
} else {
    client.login(token).catch(err => {
        console.error("❌ [Bot BCSO] Erreur de connexion :", err);
        process.exit(1);
    });
}