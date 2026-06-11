const modmailHandler = require('../functions/modmailHandler.js');

module.exports = {
    name: 'raw',
    async execute(packet, shardId, client) {
        if (packet.t !== 'MESSAGE_CREATE') return;
        if (packet.d.guild_id) return;
        if (packet.d.author && packet.d.author.bot) return;

        try {
            const channel = await client.channels.fetch(packet.d.channel_id);
            const message = await channel.messages.fetch(packet.d.id);
            
            await modmailHandler.handleDM(message, client);
        } catch (error) {
            // On garde uniquement l'erreur critique au cas où Discord plante
            console.error(`[RAW] Erreur :`, error.message);
        }
    }
};