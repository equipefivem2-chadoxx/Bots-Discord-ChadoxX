module.exports = (client) => {
    // ⚙️ CONFIGURATION
    const ROLLCALL_CHANNEL_ID = '1427731201761743021';
    const API_URL = 'https://bcso-noface.up.railway.app/api/rollcall/update';

    const EMOJIS_STATUS = {
        '✅': 'present',
        '⏳': 'retard',
        '❌': 'absent'
    };

    // 🚀 NOUVEAU : AUTO-RÉACTION SUR LES NOUVELLES ANNONCES
    client.on('messageCreate', async (message) => {
        // On vérifie qu'on est dans le bon salon et que ce n'est pas le bot qui parle
        if (message.channelId !== ROLLCALL_CHANNEL_ID || message.author.bot) return;

        // Filtre STRICT : On cherche exactement la phrase avec la date
        const dateMatch = message.content.match(/ROLL CALL DU (\d{2}\/\d{2}\/\d{2})/i);
        
        // Si c'est bien une annonce valide, le bot met les réactions tout seul
        if (dateMatch) {
            try {
                await message.react('✅');
                await message.react('❌');
                await message.react('⏳');
            } catch (error) {
                console.error("[RollCall Bot] ❌ Erreur lors de l'ajout automatique des réactions:", error);
            }
        }
    });

    // 🚀 FONCTION PRINCIPALE DE TRAITEMENT (CLICS)
    const handleReaction = async (reaction, user, action) => {
        if (user.bot) return; 

        if (reaction.partial) {
            try { await reaction.fetch(); } catch (error) { return; }
        }
        if (reaction.message.partial) {
            try { await reaction.message.fetch(); } catch (error) { return; }
        }

        if (reaction.message.channelId !== ROLLCALL_CHANNEL_ID) return;

        // FILTRE STRICT : Si le message ne contient pas ça, le clic est ignoré
        const messageContent = reaction.message.content;
        const dateMatch = messageContent.match(/ROLL CALL DU (\d{2}\/\d{2}\/\d{2})/i);
        if (!dateMatch) return; 
        
        const dateRollCall = dateMatch[1];
        const emojiName = reaction.emoji.name;

        let status;
        if (action === 'add') {
            if (!EMOJIS_STATUS[emojiName]) return; 
            status = EMOJIS_STATUS[emojiName];
        } else {
            status = 'remove'; 
        }

        // ENVOI À L'API
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

            if (!response.ok) console.error(`[RollCall Bot] ❌ Erreur API: HTTP ${response.status}`);
            else console.log(`[RollCall Bot] ✅ ${user.username} -> ${status} (${dateRollCall})`);
        } catch (error) {
            console.error("[RollCall Bot] ❌ Impossible de joindre le site web:", error.message);
        }
    };

    // 🎧 ÉCOUTEURS
    client.on('messageReactionAdd', (reaction, user) => handleReaction(reaction, user, 'add'));
    client.on('messageReactionRemove', (reaction, user) => handleReaction(reaction, user, 'remove'));
};