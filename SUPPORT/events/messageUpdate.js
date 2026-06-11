const modmailHandler = require('../functions/modmailHandler.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (newMessage.guild) return; // On ne surveille que les MP
        if (newMessage.author?.bot) return;

        // On envoie la modification au cerveau
        await modmailHandler.handleEdit(newMessage, client);
    }
};