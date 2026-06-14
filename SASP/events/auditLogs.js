const { EmbedBuilder } = require('discord.js');

module.exports = {
    // Cette fonction pourra être appelée par tes autres fichiers
    sendAuditLog: async (client, type, data) => {
        const logChannelId = '1515690751177261277';
        const logChannel = client.channels.cache.get(logChannelId);
        if (!logChannel) return;

        let color = '#9a92c7'; // Couleur par défaut (Staff)
        if (type === 'OPEN') color = '#2ECC71';      // Vert
        if (type === 'CLOSE') color = '#E74C3C';     // Rouge
        if (type === 'RENAME') color = '#F1C40F';    // Jaune

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
    }
};