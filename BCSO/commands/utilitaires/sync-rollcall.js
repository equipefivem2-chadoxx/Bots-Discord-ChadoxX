const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sync-rollcall')
        .setDescription('Synchronise un ancien message de Roll Call avec le site web.')
        .addStringOption(option => 
            option.setName('message_id')
                .setDescription('L\'ID du message de Roll Call à scanner')
                .setRequired(true)
        ),
        
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const messageId = interaction.options.getString('message_id');
        const ROLLCALL_CHANNEL_ID = '1427731201761743021';
        const API_URL = 'https://bcso-noface.up.railway.app/api/rollcall/update';

        try {
            const channel = await client.channels.fetch(ROLLCALL_CHANNEL_ID);
            if (!channel) return interaction.editReply("❌ Impossible de trouver le salon Roll Call.");

            const message = await channel.messages.fetch(messageId);
            if (!message) return interaction.editReply("❌ Message introuvable avec cet ID.");

            // Filtre strict : on ne scanne que si la date est trouvée
            const dateMatch = message.content.match(/ROLL CALL DU (\d{2}\/\d{2}\/\d{2})/i);
            if (!dateMatch) return interaction.editReply("❌ Ce message n'est pas une annonce officielle de Roll Call.");
            
            const dateRollCall = dateMatch[1];
            const EMOJIS_STATUS = { '✅': 'present', '⏳': 'retard', '❌': 'absent' };
            let count = 0;

            for (const [reactionId, reaction] of message.reactions.cache) {
                const emojiName = reaction.emoji.name;
                
                if (EMOJIS_STATUS[emojiName]) {
                    const status = EMOJIS_STATUS[emojiName];
                    
                    // 🚀 NOUVEAU : Boucle pour forcer la récupération de TOUS les utilisateurs, sans limite de cache
                    let fetchedUsers = [];
                    let lastId;
                    while (true) {
                        const options = { limit: 100 };
                        if (lastId) options.after = lastId;
                        const batch = await reaction.users.fetch(options);
                        if (batch.size === 0) break;
                        fetchedUsers.push(...batch.values());
                        lastId = batch.last().id;
                    }

                    for (const user of fetchedUsers) {
                        if (user.bot) continue;

                        try {
                            await fetch(API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    date: dateRollCall,
                                    discordId: user.id,
                                    status: status
                                })
                            });
                            count++;
                        } catch (err) {
                            console.error(`Erreur sync pour ${user.username}:`, err);
                        }
                    }
                }
            }

            await interaction.editReply(`✅ Synchronisation parfaite ! ${count} réactions envoyées au site pour le **${dateRollCall}**.`);

        } catch (error) {
            console.error("❌ Erreur commande sync-rollcall :", error);
            await interaction.editReply("⚠️ Une erreur est survenue lors de la synchronisation (vérifiez l'ID du message).");
        }
    }
};