const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    // On vérifie que le dossier existe
    if (!fs.existsSync(commandsPath)) return console.error("Dossier commands introuvable !");
    
    const commandFolders = fs.readdirSync(commandsPath);

    let count = 0;
    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        // 🛡️ SÉCURITÉ : On vérifie que c'est bien un répertoire avant d'essayer de lister son contenu
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                count++;
            }
        }
    }
    console.log(`[Commandes] ${count} commande(s) chargée(s).`);
};