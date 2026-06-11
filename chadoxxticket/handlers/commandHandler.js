const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsFoldersPath = path.join(__dirname, '..', 'commands');
    
    // Création du dossier commands s'il n'existe pas encore pour éviter les crashs
    if (!fs.existsSync(commandsFoldersPath)) {
        fs.mkdirSync(commandsFoldersPath);
        return;
    }

    const commandFolders = fs.readdirSync(commandsFoldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(commandsFoldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            } else {
                console.log(`[ATTENTION] La commande au chemin ${filePath} manque une propriété "data" ou "execute".`);
            }
        }
    }
};