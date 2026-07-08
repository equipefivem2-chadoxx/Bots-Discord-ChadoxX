const axios = require('axios');
// ⚠️ Attention : Utilise '../config.js' si ton fichier est dans "modules/" 
// ou '../../config.js' s'il est dans "modules/tickets/"
const config = require('../../config.js'); 
const { ChannelType } = require('discord.js');

module.exports = (client) => {
    
    const syncTicketsCount = async () => {
        try {
            const guild = await client.guilds.fetch(config.guildId).catch(() => null);
            
            if (!guild) {
                console.log("[SYNC] Serveur introuvable. Vérifie le guildId dans la config.");
                return;
            }

            const channels = await guild.channels.fetch();

            // 🚀 Liste des ID des salons à ignorer dans le comptage
            const salonsAIgnorer = [
                '1427847879799869440', 
                '1427848018698440764'
            ];

            const openTicketsCount = channels.filter(c => 
                c !== null && 
                c.parentId === config.ticketCategoryId && 
                c.type === ChannelType.GuildText &&
                !salonsAIgnorer.includes(c.id) // 🚀 La condition qui exclut tes deux salons
            ).size;

            await axios.post('https://bcso-noface.up.railway.app/api/tickets/sync-count', {
                count: openTicketsCount
            });

            console.log(`[SYNC] Site web mis à jour : ${openTicketsCount} tickets d'opération en cours.`);

        } catch (error) {
            console.error("[ERREUR SYNC] Impossible de synchroniser les tickets avec le site :", error.message);
        }
    };

    // ⏳ 1. Synchronisation automatique au démarrage (après 10 secondes)
    setTimeout(syncTicketsCount, 10000);
    
    // ⏳ 2. Synchronisation de sécurité en tâche de fond (toutes les 5 minutes au cas où)
    setInterval(syncTicketsCount, 300000);

    // 🚀 3. EN DIRECT : Dès qu'un salon est CRÉÉ dans Discord
    client.on('channelCreate', async (channel) => {
        // On vérifie si ce salon est créé dans la catégorie des tickets
        if (channel.parentId === config.ticketCategoryId) {
            console.log(`[SYNC] Nouveau ticket détecté (${channel.name}). Envoi au site...`);
            // On attend 1.5 seconde pour laisser le temps à Discord de stabiliser le salon dans son API
            setTimeout(syncTicketsCount, 1500);
        }
    });

    // 🚀 4. EN DIRECT : Dès qu'un salon est SUPPRIMÉ sur Discord (Fermeture/Suppression de ticket)
    client.on('channelDelete', async (channel) => {
        // On vérifie si le salon supprimé faisait partie de la catégorie des tickets
        if (channel.parentId === config.ticketCategoryId) {
            console.log(`[SYNC] Ticket supprimé/fermé (${channel.name}). Envoi au site...`);
            setTimeout(syncTicketsCount, 1000);
        }
    });
};