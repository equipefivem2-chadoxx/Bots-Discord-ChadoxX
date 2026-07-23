module.exports = (client) => {
    // ⚙️ CONFIGURATION
    const ROLLCALL_CHANNEL_ID = '1427731201761743021';
    const API_URL = 'https://bcso-noface.up.railway.app/api/rollcall/update';

    // Correspondance entre l'emoji cliqué et le statut sur le site
    const EMOJIS_STATUS = {
        '✅': 'present',
        '⏳': 'retard',
        '❌': 'absent'
    };

    // 🚀 FONCTION PRINCIPALE DE TRAITEMENT
    const handleReaction = async (reaction, user, action) => {
        if (user.bot) return; // On ignore les réactions du bot lui-même

        // Système de cache (Partials) pour lire les anciens messages
        if (reaction.partial) {
            try { await reaction.fetch(); } 
            catch (error) { console.error('Erreur fetch reaction:', error); return; }
        }
        if (reaction.message.partial) {
            try { await reaction.message.fetch(); } 
            catch (error) { console.error('Erreur fetch message:', error); return; }
        }

        // On ignore si ce n'est pas dans le bon salon
        if (reaction.message.channelId !== ROLLCALL_CHANNEL_ID) return;

        // Extraction de la date du message (cherche le format **ROLL CALL DU JJ/MM/AA**)
        const messageContent = reaction.message.content;
        const dateMatch = messageContent.match(/\*\*ROLL CALL DU (\d{2}\/\d{2}\/\d{2})\*\*/i);
        
        // Si le message n'est pas un message de roll call valide, on annule
        if (!dateMatch) return; 
        
        const dateRollCall = dateMatch[1];
        const emojiName = reaction.emoji.name;

        // Définir le statut final à envoyer au site
        let status;
        if (action === 'add') {
            if (!EMOJIS_STATUS[emojiName]) return; // L'agent a cliqué sur un emoji non géré
            status = EMOJIS_STATUS[emojiName];
        } else {
            status = 'remove'; // L'agent a retiré sa réaction
        }

        // 📡 ENVOI DE LA REQUÊTE AU SITE WEB
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dateRollCall,
                    discordId: user.id,
                    status: status
                })
            });

            if (!response.ok) {
                console.error(`[RollCall Bot] ❌ Erreur API: HTTP ${response.status}`);
            } else {
                console.log(`[RollCall Bot] ✅ Agent ${user.username} marqué comme ${status} pour le ${dateRollCall}`);
            }
        } catch (error) {
            console.error("[RollCall Bot] ❌ Impossible de joindre le site web:", error.message);
        }
    };

    // 🎧 ÉCOUTEURS D'ÉVÉNEMENTS
    client.on('messageReactionAdd', (reaction, user) => handleReaction(reaction, user, 'add'));
    client.on('messageReactionRemove', (reaction, user) => handleReaction(reaction, user, 'remove'));
};