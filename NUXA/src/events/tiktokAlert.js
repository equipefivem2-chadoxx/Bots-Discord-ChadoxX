const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const path = require('path');

let isLive = false;
let lastAlertTime = 0; // Mémoire de la dernière alerte

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        // --- CONFIGURATION ---
        const tiktokUsername = 'nunuxx._'; 
        const channelId = '1502296825749704775'; 
        const rolePingId = '1502295171759472700'; 
        
        // --- ANTI-SPAM ---
        // Temps minimum entre deux alertes (1 heure = 3600000 millisecondes)
        const ALERT_COOLDOWN = 3600000; 
        
        console.log(`[Module] Traqueur TikTok activé pour @${tiktokUsername} avec anti-spam.`);

        setInterval(async () => {
            try {
                const response = await axios.get(`https://www.tiktok.com/@${tiktokUsername}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                    }
                });

                const html = response.data;
                const isCurrentlyLive = html.includes('"roomId":"') && !html.includes('"roomId":""') && !html.includes('"roomId":"0"');

                if (isCurrentlyLive) {
                    // On vérifie si c'est un nouveau live ET si le délai d'une heure est passé
                    if (!isLive && (Date.now() - lastAlertTime > ALERT_COOLDOWN)) {
                        
                        // --- NOUVELLE LOGIQUE D'EXTRACTION DU TITRE ---
                        let liveTitle = "Rejoignez le live maintenant !"; // Message par défaut

                        try {
                            // On cherche toutes les balises script
                            const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
                            
                            // On va tenter de parser chaque script pour trouver des données JSON
                            for (const scriptContent of scripts) {
                                // On extrait le contenu texte de la balise script
                                const content = scriptContent.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1];
                                
                                if (content) {
                                    try {
                                        const jsonData = JSON.parse(content);
                                        // On cherche récursivement une clé 'title' associée à un roomId
                                        const foundTitle = findLiveTitleInJson(jsonData);
                                        if (foundTitle) {
                                            // On décode les caractères unicode
                                            liveTitle = decodeURIComponent(JSON.parse('"' + foundTitle.replace(/\"/g, '\\"') + '"'));
                                            break; // Titre trouvé, on arrête la boucle
                                        }
                                    } catch (e) {
                                        // Le script n'était pas du JSON valide, on ignore
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(`Erreur lors de l'extraction du titre pour @${tiktokUsername}:`, error);
                        }
                        // ------------------------------------------------

                        const channel = client.channels.cache.get(channelId);
                        if (channel) {
                            const logoPath = path.join(__dirname, '../pictures/logo.png');
                            const file = new AttachmentBuilder(logoPath, { name: 'logo.png' });

                            const embed = new EmbedBuilder()
                                .setTitle('🔴 NUXA EST EN DIRECT SUR TIKTOK !')
                                .setDescription(`**${liveTitle}**\n\n👉 **[Cliquez ici pour regarder le live](https://www.tiktok.com/@${tiktokUsername}/live)**`)
                                .setColor('#FF0050') 
                                .setThumbnail('attachment://logo.png')
                                .setTimestamp();

                            channel.send({ 
                                content: `Coucou <@&${rolePingId}>, le live commence !`, 
                                embeds: [embed],
                                files: [file] 
                            });

                            // On enregistre l'heure de cette alerte
                            lastAlertTime = Date.now();
                        }
                    }
                    // Qu'il y ait eu alerte ou non, on confirme que la personne est bien en live
                    isLive = true; 
                } 
                else {
                    // Si TikTok dit qu'il n'y a pas de live, on met à jour le statut.
                    isLive = false;
                }

            } catch (error) {
                // Erreurs ignorées silencieusement
            }
        }, 180000); // Vérification toutes les 3 minutes
    },
};

/**
 * Fonction helper pour chercher récursivement un titre de live dans un objet JSON.
 * Elle cherche une clé "title" qui se trouve dans le même objet qu'une clé "roomId".
 * @param {object} obj L'objet à fouiller.
 * @returns {string|null} Le titre trouvé, ou null sinon.
 */
function findLiveTitleInJson(obj) {
    if (typeof obj !== 'object' || obj === null) return null;
    
    // Si on a un titre et un roomId, on suppose que c'est l'objet du live room
    if (obj.title && obj.roomId) {
        return obj.title;
    }
    
    // Sinon on cherche récursivement dans tous les sous-objets
    for (const key in obj) {
        const result = findLiveTitleInJson(obj[key]);
        if (result) return result;
    }
    
    return null;
}