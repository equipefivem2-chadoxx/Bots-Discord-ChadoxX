const { ActivityType, Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady, // Utilise le nouveau nom correct
    once: true,
    execute(client) {
        console.log(`✅ [SUPPORT] Connecté en tant que ${client.user.tag}`);
        client.user.setActivity({
            name: 'Custom Status',
            type: ActivityType.Custom,
            state: 'Ticket → MP'
        });
    },
};