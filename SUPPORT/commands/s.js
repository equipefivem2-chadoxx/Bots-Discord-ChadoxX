const fs = require('fs');
const path = require('path');

module.exports = {
    name: 's',
    description: 'Affiche la liste de tous les messages prédéfinis',

    async execute(message, args, client) {
        const dbPath = path.join(__dirname, '../data/customMessages.json');
        
        // On initialise la liste avec les commandes natives
        let commandNames = ['`!!hi`', '`!!bye`'];
        
        // On récupère uniquement le nom des commandes personnalisées (pas le texte)
        if (fs.existsSync(dbPath)) {
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            for (const cmd of Object.keys(db)) {
                commandNames.push(`\`${cmd}\``);
            }
        }

        // On assemble tout sur une seule ligne, séparé par des virgules
        const finalText = "📜 **Liste des messages prédéfinis :** " + commandNames.join(', ');

        return message.reply({ content: finalText });
    }
};