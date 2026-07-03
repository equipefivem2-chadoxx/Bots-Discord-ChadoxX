// BCSO/events/deployCommands.js
const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.js'); // 👈 On importe la config pour l'ID du serveur

module.exports = (client) => {
    client.commands = new Collection();

    client.once('ready', async () => {
        const commandsArray = [];
        const commandsPath = path.join(__dirname, '../commands');
        
        // Sécurité : si le dossier n'existe pas, on le crée
        if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true });

        // On lit les sous-dossiers
        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const command = require(`${folderPath}/${file}`);
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commandsArray.push(command.data.toJSON());
                }
            }
        }

        if (commandsArray.length > 0) {
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_BCSO);
            try {
                // ⚡ CHANGEMENT ICI : On utilise applicationGuildCommands pour un affichage immédiat
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, config.guildId),
                    { body: commandsArray }
                );
                console.log(`✅ [Commandes BCSO] ${commandsArray.length} Slash Command(s) synchronisée(s) avec succès sur le serveur de test !`);
            } catch (error) {
                console.error("❌ [Commandes BCSO] Erreur lors du déploiement :", error);
            }
        } else {
            console.log("⚠️ [Commandes BCSO] Aucune commande trouvée dans les dossiers.");
        }
    });
};