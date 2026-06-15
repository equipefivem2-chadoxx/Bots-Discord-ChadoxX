const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'logs',
    description: 'Voir l\'historique des tickets.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("❌ Permission refusée.");
        }

        const targetId = args[0];
        if (!targetId) return message.reply("⚠️ Usage : `!logs [ID Discord]`");

        const dbPath = path.join(__dirname, '../ticketHistory.json');
        if (!fs.existsSync(dbPath)) return message.reply("❌ Aucune donnée.");

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const userLogs = db.filter(entry => entry.userId === targetId);

        if (userLogs.length === 0) return message.reply("✅ Aucun historique trouvé pour cet ID.");

        let description = `Historique complet pour l'utilisateur :\n\n`;
        
        userLogs.forEach(log => {
            // Le lien cliquable qui ouvrira internet
            const link = log.archiveLink ? `[🌐 Ouvrir sur internet](${log.archiveLink})` : "*(Aucune archive)*";
            description += `**[${log.date}]** • ${log.action} • Salon: \`${log.channelName}\` • ${link}\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`📜 Logs Tickets - ${userLogs[0].userName}`)
            .setColor('#9a92c7')
            .setDescription(description.length > 4096 ? description.substring(0, 4093) + '...' : description);

        await message.channel.send({ embeds: [embed] });
    }
};