const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    // On crée la collection ici, sans toucher à l'index.js !
    client.commands = new Collection();

    client.once('ready', async () => {
        const commandsArray = [];
        const commandsPath = path.join(__dirname, '../commands');
        
        // Sécurité : si le dossier n'existe pas, on le crée
        if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

        // On lit les sous-dossiers (ex: /commands/utilitaires/)
        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const command = require(`${folderPath}/${file}`);
                // On vérifie que la commande est valide avant de la charger
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commandsArray.push(command.data.toJSON());
                }
            }
        }

        // Si on a trouvé des commandes, on les pousse sur Discord
        if (commandsArray.length > 0) {
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_BCSO);
            try {
                await rest.put(
                    Routes.applicationCommands(client.user.id),
                    { body: commandsArray }
                );
                console.log(`✅ [Commandes] ${commandsArray.length} Slash Command(s) (/) synchronisée(s) !`);
            } catch (error) {
                console.error("❌ [Commandes] Erreur lors du déploiement :", error);
            }
        }
    });
};