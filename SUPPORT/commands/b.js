const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'b',
    description: 'Blacklist un joueur des tickets (!b 30d id ou !b id)',

    async execute(message, args, client) {
        let targetId = args[0];
        let duration = args[1];

        // Système intelligent pour inverser durée et ID si besoin
        if (args[0] && args[0].toLowerCase().includes('d')) {
            duration = args[0];
            targetId = args[1];
        }

        if (!targetId) return message.reply("❌ **Erreur :** Utilisation `!b 30d <id>` ou `!b <id>`");

        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
        const dbPath = path.join(dataDir, 'blacklist.json');
        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        let expireAt = null; 
        let durationText = "Définitive (à vie)";

        if (duration) {
            const match = duration.toLowerCase().match(/^(\d+)(d)$/);
            if (match) {
                const days = parseInt(match[1]);
                expireAt = Date.now() + (days * 24 * 60 * 60 * 1000);
                durationText = `${days} jour(s)`;
            } else {
                return message.reply("❌ **Erreur :** Format invalide. Utilise 'd' pour les jours (ex: 30d).");
            }
        }

        // On enregistre maintenant QUI a banni et QUAND
        db[targetId] = { 
            expireAt: expireAt, 
            reason: "Blacklist ticket",
            modId: message.author.id, // ID du staff
            bannedAt: Date.now()      // Date du ban
        };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
        
        return message.reply(`✅ **Blacklist confirmée**\n👤 **Joueur :** \`${targetId}\`\n⏳ **Durée :** ${durationText}\n🛡️ **Modérateur :** <@${message.author.id}>`);
    }
};