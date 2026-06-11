const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'msdel',
    description: 'Supprime un message prédéfini personnalisé',

    async execute(message, args, client) {
        const cmdName = args[0]; // Exemple: !!test
        
        if (!cmdName) {
            return message.reply("❌ Utilisation : `!msdel <nom_de_la_commande>` (ex: `!msdel !!test`)");
        }

        // Sécurité : on empêche la suppression de !!hi et !!bye car ce sont des fichiers physiques
        if (cmdName === '!hi' || cmdName === '!!hi' || cmdName === '!bye' || cmdName === '!!bye') {
            return message.reply("❌ Tu ne peux pas supprimer les messages de base (`!!hi` et `!!bye`) avec cette commande.");
        }

        const dbPath = path.join(__dirname, '../data/customMessages.json');
        if (!fs.existsSync(dbPath)) {
            return message.reply("⚠️ Aucun message personnalisé n'existe.");
        }

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        // Si on trouve la commande dans le fichier
        if (db[cmdName]) {
            delete db[cmdName]; // On supprime
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4)); // On sauvegarde
            
            return message.reply(`✅ Le message prédéfini \`${cmdName}\` a été supprimé avec succès !`);
        } else {
            return message.reply(`❌ Aucun message prédéfini trouvé avec le nom \`${cmdName}\`. Fais \`!s\` pour vérifier l'orthographe.`);
        }
    }
};