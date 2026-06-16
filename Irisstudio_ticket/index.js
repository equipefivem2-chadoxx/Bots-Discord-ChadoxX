const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

// Création du client avec les intentions de base
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Événement déclenché quand le bot est allumé
client.once('ready', () => {
    console.log(`✅ ALLUMAGE RÉUSSI : ${client.user.tag} est en ligne !`);
});

// Connexion du bot avec le token du config.json
client.login(config.token);