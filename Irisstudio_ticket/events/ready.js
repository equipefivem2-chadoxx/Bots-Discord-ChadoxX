const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ ALLUMAGE RÉUSSI : ${client.user.tag} est en ligne !`);
        
        // Définition du statut personnalisé "Regarde discord.gg/Iris'Studio"
        client.user.setActivity("discord.gg/Iris'Studio", { 
            type: ActivityType.Watching 
        });
    },
};