const modmailHandler = require('../functions/modmailHandler.js');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (message.guild) return; // Uniquement MP

        // Quand un message est supprimé, Discord l'efface parfois de sa mémoire. 
        // On doit retrouver l'ID du joueur via son salon privé :
        let userId = message.author?.id;
        if (!userId && message.channel.type === 1) { 
            const channel = await client.channels.fetch(message.channelId).catch(() => null);
            userId = channel?.recipient?.id || channel?.recipientId;
        }
        
        if (!userId) return;

        // On envoie l'alerte de suppression
        await modmailHandler.handleDelete(message.id, userId, client);
    }
};