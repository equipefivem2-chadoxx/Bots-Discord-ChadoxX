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

            // 🚀 NOUVEAU : Liste des ID des salons à ignorer dans le comptage
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

    setTimeout(syncTicketsCount, 10000);
    setInterval(syncTicketsCount, 300000);
};