require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.TOKEN_BCSO;

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions // 🚀 Obligatoire pour écouter les réactions
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.User // 🚀 Obligatoire pour capter les réactions sur les anciens messages de roll call
    ]
});

// 🔄 Fonction d'auto-chargement 100% modulaire
const loadFiles = (dir) => {
    const dirPath = path.join(__dirname, dir);

    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory()) {
            loadFiles(`${dir}/${file.name}`);
        } 
        else if (file.name.endsWith('.js')) {
            const modulePath = `./${dir}/${file.name}`;

            try {
                const module = require(modulePath);

                if (typeof module === 'function') {
                    module(client);
                }

            } catch (error) {
                console.error(`❌ Erreur chargement ${modulePath}:`, error);
            }
        }
    }
};

// Charge automatiquement les events et modules
loadFiles('events');
loadFiles('modules');

if (!token) {
    console.error("❌ [Bot BCSO] CRASH : Le TOKEN_BCSO est introuvable !");
    process.exit(1);
}

client.login(token)
    .then(() => {
        console.log("✅ [Bot BCSO] Connecté avec succès !");
    })
    .catch(err => {
        console.error("❌ [Bot BCSO] Erreur connexion :", err);
        process.exit(1);
    });