const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'logs',
    description: 'Voir l\'historique et les liens d\'archives des tickets.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("❌ Permission refusée.");
        }

        const targetId = args[0]; // On prend l'ID brut
        if (!targetId) return message.reply("⚠️ Usage : `!logs [ID Discord]`");

        const dbPath = path.join(__dirname, '../ticketHistory.json');
        if (!fs.existsSync(dbPath)) return message.reply("❌ Aucune donnée.");

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const userLogs = db.filter(entry => entry.userId === targetId);

        if (userLogs.length === 0) return message.reply("✅ Aucun historique.");

        let description = `Historique pour **${userLogs[0].userName}** :\n\n`;
        
        userLogs.forEach(log => {
            // Si tu as le lien de l'archive, on l'affiche ici
            // Note : Si log.archiveLink existe, on crée un lien cliquable
            const link = log.archiveLink ? `[Lire l'archive](${log.archiveLink})` : "Pas d'archive disponible";
            description += `**[${log.date}]** • ${log.action} • ${link}\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`📜 Logs Tickets - ${targetId}`)
            .setColor('#9a92c7')
            .setDescription(description);

        await message.channel.send({ embeds: [embed] });
    }
};