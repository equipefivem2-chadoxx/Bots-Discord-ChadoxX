const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ib',
    description: 'Vérifie si un joueur est blacklisté',

    async execute(message, args, client) {
        const targetId = args[0];
        if (!targetId) return message.reply("❌ **Erreur :** Précise l'ID du joueur (`!ib <id>`).");

        const dbPath = path.join(__dirname, '../data/blacklist.json');
        if (!fs.existsSync(dbPath)) return message.reply(`ℹ️ L'utilisateur \`${targetId}\` n'est **pas** blacklisté.`);

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const userBl = db[targetId];

        if (!userBl) return message.reply(`ℹ️ L'utilisateur \`${targetId}\` n'est **pas** blacklisté.`);

        // On prépare le texte de base
        let text = `🚨 **Dossier Blacklist** 🚨\n`;
        text += `👤 **Utilisateur :** \`${targetId}\`\n`;
        
        // Si les données du modérateur/date existent (pour les futurs bans)
        if (userBl.modId) text += `🛡️ **Sanctionné par :** <@${userBl.modId}>\n`;
        if (userBl.bannedAt) text += `📅 **Banni le :** <t:${Math.floor(userBl.bannedAt / 1000)}:f>\n`;

        // Vérification de la durée
        if (userBl.expireAt === null) {
            text += `⏳ **Expiration :** Définitive (à vie)`;
            return message.reply(text);
            
        } else if (userBl.expireAt > Date.now()) {
            text += `⏳ **Expiration :** <t:${Math.floor(userBl.expireAt / 1000)}:f> (<t:${Math.floor(userBl.expireAt / 1000)}:R>)`;
            return message.reply(text);
            
        } else {
            // Le temps est écoulé
            delete db[targetId];
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
            return message.reply(`ℹ️ L'utilisateur \`${targetId}\` n'est **plus** blacklisté (sanction expirée).`);
        }
    }
};