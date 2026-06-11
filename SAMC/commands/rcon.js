const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'rcon', // Commande !rcon ou !RCON
    description: 'Ouvre les recrutements SAMC et modifie le panneau',
    
    async execute(message, args) {
        // --- 1. SÉCURITÉS ---
        const salonCommandeId = '1489643979921297439';
        if (message.channel.id !== salonCommandeId) {
            const warning = await message.reply(`❌ Utilisez cette commande dans <#${salonCommandeId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        const rolesAutorises = ['1489641130206298303', '1487833898150006956', '1487833901849120788'];
        if (!rolesAutorises.some(roleId => message.member.roles.cache.has(roleId))) {
            const warning = await message.reply("❌ Vous n'avez pas les habilitations requises.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- 2. RECHERCHE DU MESSAGE AUTOMATIQUE ---
        const salonCibleId = '1487944471294513272';
        const salonCible = message.guild.channels.cache.get(salonCibleId);

        if (!salonCible) return;

        // Le bot cherche dans les 50 derniers messages du salon
        const messagesHisto = await salonCible.messages.fetch({ limit: 50 });
        const panneauMessage = messagesHisto.find(m => 
            m.author.id === message.client.user.id && 
            m.embeds.length > 0 && 
            m.embeds[0].title.includes('RECRUTEMENTS SAMC')
        );

        if (!panneauMessage) {
            const errorMsg = await message.reply("❌ Impossible de trouver le panneau de recrutement. Avez-vous fait `!embeedRC` d'abord ?");
            setTimeout(() => { errorMsg.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- 3. LE NOUVEL EMBED (OUVERT) ---
        const embedOuvert = new EmbedBuilder()
            .setTitle('🚑 RECRUTEMENTS SAMC : OUVERTS')
            .setColor('#2ecc71') // Vert pour dire que c'est ouvert
            .setDescription('Les candidatures pour le San Andreas Medical Center sont actuellement ouvertes.\n\nC’est le moment de tenter ta chance et de rejoindre nos équipes.')
            .addFields(
                { 
                    name: '📅 Informations', 
                    value: "Les recrutements sont ouverts pour une durée limitée.\n\nAssure-toi de déposer ta candidature correctement avant leur fermeture.",
                    inline: false 
                },
                { 
                    name: '📋 Conditions requises', 
                    value: "Avant de postuler, vérifie que tu remplis les critères suivants :\n• Être motivé et intéressé par le domaine médical\n• Avoir un bon sens de la communication et de l’esprit d’équipe\n• Respecter les règles, procédures et protocoles\n• Avoir minimum 21 ans en RP (16 ans HRP)\n• Disposer d’un casier judiciaire vierge\n• Être disponible et sérieux dans ton rôle",
                    inline: false 
                },
                {
                    name: '📝 Candidature',
                    value: "Si tu remplis l’ensemble de ces critères, tu peux dès maintenant cliquer sur le bouton candidater, et compléter le formulaire de recrutement.\n\n👉 Prends le temps de faire une candidature propre et détaillée, elle sera étudiée avec attention.",
                    inline: false
                }
            )
            .setFooter({ text: 'Direction du SAMC - San Andreas' })
            .setTimestamp();

        const boutonActif = new ButtonBuilder()
            .setCustomId('btn_candidater') // L'ID qui nous servira pour le formulaire plus tard
            .setLabel('Candidater')
            .setEmoji('🔓')
            .setStyle(ButtonStyle.Success) // Bouton Vert
            .setDisabled(false); // Bouton cliquable !

        const row = new ActionRowBuilder().addComponents(boutonActif);

        // --- 4. MODIFICATION DU MESSAGE ---
        await panneauMessage.edit({ embeds: [embedOuvert], components: [row] });

        const success = await message.reply("✅ Les recrutements sont désormais **OUVERTS** ! Le panneau a été mis à jour.");
        setTimeout(() => { success.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
    }
};