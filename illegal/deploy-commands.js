require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
    REST,
    Routes
} = require('discord.js');

const commands = [];

// 📂 Chargement des commandes
const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const command = require(path.join(commandsPath, file));

    commands.push(command.data.toJSON());

}

// 🔑 API REST
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// 🚀 Déploiement
(async () => {

    try {

        console.log('🧹 Suppression anciennes commandes globales...');

        // ❌ Supprime anciennes globales
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {
                body: []
            }
        );

        console.log('✅ Anciennes commandes globales supprimées.');

        console.log('🔄 Déploiement des commandes serveur...');

        // ✅ Déploiement serveur instantané
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(`✅ ${commands.length} commande(s) déployée(s).`);

    } catch (error) {

        console.error('❌ Erreur déploiement :', error);

    }

})();