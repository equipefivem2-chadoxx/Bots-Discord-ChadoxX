const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.TOKEN_BCSO; 

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// 🔄 Fonction d'auto-chargement 100% modulaire
const loadFiles = (dir) => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) return; // Si le dossier n'existe pas encore, on ignore
    
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            loadFiles(`${dir}/${file.name}`); // Fouille dans les sous-dossiers
        } else if (file.name.endsWith('.js')) {
            const module = require(`./${dir}/${file.name}`);
            if (typeof module === 'function') {
                module(client); // Exécute le module en lui passant le client
            }
        }
    }
};

// Charge tout automatiquement !
loadFiles('events');
loadFiles('modules');

if (!token) {
    console.error("❌ [Bot BCSO] CRASH : Le TOKEN_BCSO est introuvable !");
    process.exit(1);
} else {
    client.login(token).catch(err => {
        console.error("❌ [Bot BCSO] Erreur :", err);
        process.exit(1);
    });
}