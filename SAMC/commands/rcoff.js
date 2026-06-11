const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs'); // AJOUTÉ POUR LE RESET
const path = require('path'); // AJOUTÉ POUR LE RESET

module.exports = {
    name: 'rcoff', // Commande !rcoff ou !RCOFF
    description: 'Ferme les recrutements SAMC et modifie le panneau',
    
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

        // --- 3. LE NOUVEL EMBED (FERMÉ) ---
        const embedFerme = new EmbedBuilder()
            .setTitle('🚑 RECRUTEMENTS SAMC : FERMÉS')
            .setColor('#8a0303') 
            .setDescription('Les candidatures pour le San Andreas Medical Center ne sont pas ouvertes pour le moment.\n\nIl n’est donc actuellement pas possible de postuler.')
            .addFields(
                { 
                    name: '📅 Informations', 
                    value: "Les recrutements ouvrent uniquement lors de périodes spécifiques.\n\nUne annonce sera faite dans ce salon par un membre du SAMC dès leur ouverture.\n👉 Pense à rester attentif et à ne pas désactiver les notifications.",
                    inline: false 
                },
                { 
                    name: '📋 Conditions requises', 
                    value: "Pour pouvoir intégrer le SAMC, tu dois :\n• Être motivé et intéressé par le domaine médical\n• Avoir un bon sens de la communication et de l’esprit d’équipe\n• Respecter les règles, procédures et protocoles\n• Avoir minimum 21 ans en RP (16 ans HRP)\n• Disposer d’un casier judiciaire vierge\n• Être disponible et sérieux dans ton rôle",
                    inline: false 
                },
                {
                    name: '📝 Candidature',
                    value: "Si tu remplis l’ensemble de ces critères, tu pourras remplir le formulaire dès que les recrutements seront ouverts.",
                    inline: false
                }
            )
            .setFooter({ text: 'Direction du SAMC - San Andreas' })
            .setTimestamp();

        const boutonBloque = new ButtonBuilder()
            .setCustomId('btn_candidater')
            .setLabel('Candidater')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true); // Bouton bloqué !

        const row = new ActionRowBuilder().addComponents(boutonBloque);

        // --- 4. MODIFICATION DU MESSAGE ---
        await panneauMessage.edit({ embeds: [embedFerme], components: [row] });

        // --- 5. VIDAGE AUTOMATIQUE DE LA MÉMOIRE DES CANDIDATURES ---
        try {
            const dbPath = path.join(__dirname, '../functions/db_candidatures.json');
            fs.writeFileSync(dbPath, JSON.stringify({})); // Écrase le fichier avec un objet vide
            console.log("[SAMC] Les candidatures ont été réinitialisées suite à la fermeture (!rcoff).");
        } catch (error) {
            console.error("Erreur lors du reset automatique des candidatures :", error);
        }

        const success = await message.reply("✅ Les recrutements sont désormais **FERMÉS** ! Le panneau a été mis à jour et les compteurs de candidatures remis à zéro.");
        setTimeout(() => { success.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
    }
};