// src/events/botStatusRp.js

const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true, // S'exécute une seule fois au démarrage
    execute(client) {
        
        // --- CONFIGURATION DU STATUT ---
        const statusText = "écrire une nouvelle histoire... ⏳"; 
        
        // On utilise "Playing" pour afficher : "Joue à écrire une nouvelle histoire... ⏳"
        const activityType = ActivityType.Playing; 

        // Tu peux choisir la pastille de couleur : 
        // 'online' (vert), 'idle' (lune orange - parfait pour le mystère), 'dnd' (rouge)
        const botStatus = 'online'; 

        // Application du statut
        client.user.setPresence({
            activities: [{ 
                name: statusText, 
                type: activityType 
            }],
            status: botStatus,
        });

        console.log(`[Module] Statut mystère activé : ${statusText}`);
    },
};