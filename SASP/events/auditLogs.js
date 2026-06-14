const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    sendAuditLog: async (client, type, data) => {
        const logChannelId = '1515690751177261277';
        const logChannel = client.channels.cache.get(logChannelId);
        if (!logChannel) return;

        let color = '#9a92c7';
        if (type === 'OPEN') color = '#2ECC71';
        if (type === 'CLOSE') color = '#E74C3C';
        if (type === 'RENAME') color = '#F1C40F';

        const embed = new EmbedBuilder()
            .setTitle(`🎫 LOGS SASP - ${type}`)
            .setColor(color)
            .addFields(
                { name: '👤 Utilisateur', value: data.user, inline: true },
                { name: '📂 Salon', value: data.channelName, inline: true },
                { name: '📝 Action', value: data.action }
            )
            .setTimestamp();

        if (data.details) embed.addFields({ name: '🔍 Détails', value: data.details });
        await logChannel.send({ embeds: [embed] });
    },

    saveTicket: (userId, userName, channelName, action, archiveUrl = null) => {
        const dbPath = path.join(__dirname, '../ticketHistory.json');
        let db = [];
        if (fs.existsSync(dbPath)) {
            try { 
                const content = fs.readFileSync(dbPath, 'utf8');
                db = content ? JSON.parse(content) : []; 
            } catch (err) { db = []; }
        }
        db.push({ 
            userId, 
            userName, 
            channelName, 
            action, 
            archiveLink: archiveUrl, 
            date: new Date().toLocaleString('fr-FR') 
        });
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
    }
};