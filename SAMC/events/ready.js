const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Le bot SAMC est 100% opérationnel ! Connecté en tant que ${client.user.tag}`);

        // Définit le statut du bot
        client.user.setActivity('Secrétaire Du SAMC', { type: ActivityType.Custom });
    },
};