const { ActivityType } = require('discord.js');

module.exports = (client) => {
    client.once('ready', () => {
        console.log(`🚓 [Bot BCSO] Connecté avec succès en tant que ${client.user.tag}`);
        
        // Le statut RP
        client.user.setPresence({
            activities: [{ name: 'Surveille le poste', type: ActivityType.Watching }],
            status: 'online', // 'online', 'idle', 'dnd'
        });
    });
};