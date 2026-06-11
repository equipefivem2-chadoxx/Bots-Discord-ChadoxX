const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'unban',
    description: 'Retire un joueur de la blacklist',

    async execute(message, args, client) {
        const targetId = args[0];
        if (!targetId) return message.reply("❌ **Erreur :** Précise l'ID du joueur (`!unban <id>`).");

        const dbPath = path.join(__dirname, '../data/blacklist.json');
        if (!fs.existsSync(dbPath)) return message.reply("⚠️ La base de données est vide.");

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        if (db[targetId]) {
            delete db[targetId];
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
            return message.reply(`✅ **Blacklist levée** | L'utilisateur \`${targetId}\` a été réintégré au système de tickets.`);
        } else {
            return message.reply("⚠️ Cet utilisateur n'est pas blacklisté.");
        }
    }
};