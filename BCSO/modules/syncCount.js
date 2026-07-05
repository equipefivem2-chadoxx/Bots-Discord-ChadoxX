const axios = require('axios');
const config = require('../../config.js');
const { ChannelType } = require('discord.js'); // Importation officielle pour les types de salons

module.exports = (client) => {
    
    // Fonction qui compte et envoie au site web
    const syncTicketsCount = async () => {
        try {
            // On s'assure de bien récupérer le serveur (fetch permet d'éviter les erreurs de cache vide)
            const guild = await client.guilds.fetch(config.guildId).catch(() => null);
            
            if (!guild) {
                console.log("[SYNC] Serveur introuvable. Vérifie le guildId dans la config.");
                return;
            }

            // 🚀 CORRECTION : On force la récupération en temps réel de tous les salons du serveur
            const channels = await guild.channels.fetch();

            // On filtre pour ne garder que les salons textes de la catégorie spécifique
            const openTicketsCount = channels.filter(c => 
                c !== null && 
                c.parentId === config.ticketCategoryId && 
                c.type === ChannelType.GuildText // Plus propre et sûr que "0"
            ).size;

            // On envoie la donnée exacte au site web
            await axios.post('https://bcso-noface.up.railway.app/api/tickets/sync-count', {
                count: openTicketsCount
            });

            console.log(`[SYNC] Site web mis à jour : ${openTicketsCount} tickets d'opération en cours.`);

        } catch (error) {
            console.error("[ERREUR SYNC] Impossible de synchroniser les tickets avec le site :", error.message);
        }
    };

    // Exécuter une première fois quand le bot démarre (après 10 secondes)
    setTimeout(syncTicketsCount, 10000);

    // Ensuite, répéter toutes les 5 minutes (300 000 millisecondes)
    setInterval(syncTicketsCount, 300000);
};