const { Events } = require('discord.js');
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`💙 Le bot SASP est en ligne ! Connecté : ${client.user.tag}`);
    },
};