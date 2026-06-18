const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady', // <-- Ça corrige l'erreur rouge DeprecationWarning
    once: true,
    execute(client) {
        console.log(`✅ ALLUMAGE RÉUSSI (Modulaire) : ${client.user.tag} est en ligne !`);
        
        // Force l'affichage du statut
        client.user.setPresence({
            activities: [{ 
                name: "Surveille Iris'Studio", 
                type: ActivityType.Watching 
            }],
            status: 'online'
        });
    },
};