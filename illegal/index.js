const fs = require('fs');
const path = require('path');
// Chargement des tokens et de la config
const tokens = fs.existsSync(path.join(__dirname, '../tokens.js')) ? require('../tokens.js') : process.env;
const config = require('./config.json'); // <-- On charge la config locale

// ... reste du code inchangé jusqu'à la fonction deployCommands ...

async function deployCommands() {
    const commands = Array.from(client.commands.values()).map(c => c.data.toJSON());
    const token = tokens.TOKEN_ILLEGAL || process.env.TOKEN_ILLEGAL;
    
    if (!token) return console.error("❌ Token ILLEGAL manquant !");

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                config.CLIENT_ID, // <-- Lecture via config.json
                config.GUILD_ID   // <-- Lecture via config.json
            ),
            { body: commands }
        );
        console.log("✅ Commandes slash déployées pour ILLEGAL");
    } catch (error) {
        console.error('❌ Erreur déploiement commandes :', error);
    }
}