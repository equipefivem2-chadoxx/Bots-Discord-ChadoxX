const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.ChannelDelete, // On logue quand un ticket est supprimé
    async execute(channel) {
        // ID du salon des logs
        const logChannelId = '1515690751177261277';
        const logChannel = channel.client.channels.cache.get(logChannelId);
        if (!logChannel) return;

        // On ne logue que si c'est un salon qui contenait "dossier" ou "ticket"
        if (!channel.name.includes('dossier') && !channel.name.includes('ticket')) return;

        const embed = new EmbedBuilder()
            .setTitle('📁 LOGS - FERMETURE DE TICKET')
            .setColor('#2C3E50') // Gris foncé élégant
            .setDescription(`Le salon **#${channel.name}** vient d'être supprimé.`)
            .addFields(
                { name: 'Catégorie', value: channel.parent ? channel.parent.name : 'Inconnu', inline: true },
                { name: 'ID Salon', value: `\`${channel.id}\``, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
};