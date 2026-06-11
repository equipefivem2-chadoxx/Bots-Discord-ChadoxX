const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: { name: 'embeedpostuler' },
    name: 'embeedpostuler',
    async execute(message, args) {
        // --- SÉCURITÉ ---
        const salonCommandeId = '1490116027298742446';
        if (message.channel.id !== salonCommandeId) {
            const warning = await message.reply(`❌ Utilisez cette commande dans <#${salonCommandeId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        const roleAutoriseId = '1487835814326046830'; 
        if (!message.member.roles.cache.has(roleAutoriseId)) {
            const warning = await message.reply("❌ Permission refusée.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- CRÉATION DES BOUTONS ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_recrutement_ouvert')
                .setLabel('🟢 Ouvrir Recrutement')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('btn_recrutement_ferme')
                .setLabel('🔴 Fermer Recrutement')
                .setStyle(ButtonStyle.Danger)
        );

        // On envoie le panneau de contrôle (sans faire un "répondre à")
        await message.channel.send({ 
            content: "🛠️ **Panneau de gestion des recrutements**\nChoisissez l'action à effectuer pour faire apparaître le formulaire :", 
            components: [row] 
        });

        // 🗑️ ON SUPPRIME TON MESSAGE "!embeedpostuler"
        await message.delete().catch(()=>{});
    }
};