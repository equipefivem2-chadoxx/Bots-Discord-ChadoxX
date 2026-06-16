const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady', // <-- LA CORRECTION EST ICI
    once: true,
    execute(client) {
        console.log(`✅ ALLUMAGE RÉUSSI : ${client.user.tag} est en ligne !`);
        
        // Définition du statut personnalisé
        client.user.setActivity("discord.gg/Iris'Studio", { 
            type: ActivityType.Watching 
        });
    },
};