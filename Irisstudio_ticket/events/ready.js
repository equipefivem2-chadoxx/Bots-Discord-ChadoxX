const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady', // Supprime définitivement l'erreur "DeprecationWarning"
    once: true,
    execute(client) {
        console.log(`✅ ALLUMAGE RÉUSSI : ${client.user.tag} est en ligne !`);
        
        // Méthode forte pour forcer l'affichage du statut
        client.user.setPresence({
            activities: [{ 
                name: "discord.gg/Iris'Studio", 
                type: ActivityType.Watching 
            }],
            status: 'online'
        });
    },
};