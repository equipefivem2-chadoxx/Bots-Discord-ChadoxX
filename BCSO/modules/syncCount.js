const axios = require('axios');
const config = require('../../config.js');

module.exports = (client) => {
    
    // Fonction qui compte et envoie au site web
    const syncTicketsCount = async () => {
        try {
            const guild = client.guilds.cache.get(config.guildId);
            if (!guild) return;

            // On récupère le nombre de salons texte présents dans la catégorie ticket
            const openTicketsCount = guild.channels.cache.filter(c => 
                c.parentId === config.ticketCategoryId && 
                c.type === 0 // 0 = GUILD_TEXT
            ).size;

            // On envoie la donnée au site web
            await axios.post('https://bcso-noface.up.railway.app/api/tickets/sync-count', {
                count: openTicketsCount
            });

            console.log(`[SYNC] Site web mis à jour : ${openTicketsCount} tickets en cours.`);

        } catch (error) {
            console.error("[ERREUR SYNC] Impossible de synchroniser les tickets avec le site :", error.message);
        }
    };

    // Exécuter une première fois quand le bot démarre (après 10 secondes le temps que tout charge)
    setTimeout(syncTicketsCount, 10000);

    // Ensuite, répéter toutes les 5 minutes (300 000 millisecondes)
    // Tu peux changer ce chiffre : 60000 = 1 minute, 300000 = 5 minutes
    setInterval(syncTicketsCount, 300000);
};