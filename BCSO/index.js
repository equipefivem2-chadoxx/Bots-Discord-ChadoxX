// bot-bcso/index.js
const { Client, GatewayIntentBits } = require('discord.js');

// On récupère le token spécifique au BCSO
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

// Connexion du bot
if (!token) {
    console.error("❌ [Bot BCSO] Erreur : Le TOKEN_BCSO est introuvable dans le fichier .env !");
} else {
    client.login(token).catch(err => console.error("❌ [Bot BCSO] Erreur de connexion :", err));
}