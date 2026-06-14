const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'logs',
    description: 'Voir l\'historique des tickets d\'un utilisateur.',
    async execute(message, args) {
        // Sécurité : Réservé au staff
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("❌ Tu n'as pas la permission d'accéder aux logs.");
        }

        const target = message.mentions.users.first() || message.client.users.cache.get(args[0]);
        if (!target) return message.reply("⚠️ Usage : `!logs @Utilisateur`");

        const dbPath = path.join(__dirname, '../ticketHistory.json');
        if (!fs.existsSync(dbPath)) return message.reply("❌ Aucune donnée d'historique trouvée.");

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const userLogs = db.filter(entry => entry.userId === target.id);

        if (userLogs.length === 0) return message.reply("✅ Cet utilisateur n'a aucun historique de ticket.");

        // Formatage des logs pour l'embed
        let description = `Historique pour **${target.username}** :\n\n`;
        userLogs.forEach(log => {
            description += `**[${log.date}]** • ${log.action} • Salon: \`${log.channelName}\`\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`📜 Logs Tickets - ${target.username}`)
            .setColor('#9a92c7')
            .setDescription(description.length > 4096 ? description.substring(0, 4093) + '...' : description)
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};