const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady', // Remplacé Events.ClientReady par 'clientReady' pour éviter le warning
    once: true,
    execute(client) {
        console.log(`🏛️ Bot GOUVERNEMENT en ligne !`);
        client.user.setActivity('le bien d\'IrisFA', { type: ActivityType.Watching });
    },
};