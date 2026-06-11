const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'embeedrc', 
    description: 'Envoie l\'embed de recrutement fermé',
    
    async execute(message, args) {
        const salonCommandeId = '1489643979921297439';
        if (message.channel.id !== salonCommandeId) {
            const warning = await message.reply(`❌ Vous devez utiliser cette commande dans le salon officiel : <#${salonCommandeId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        const rolesAutorises = ['1489641130206298303', '1487833898150006956', '1487833901849120788'];
        const possedeLeRole = rolesAutorises.some(roleId => message.member.roles.cache.has(roleId));

        if (!possedeLeRole) {
            const warning = await message.reply("❌ Vous n'avez pas les habilitations (Direction/Recrutement) pour faire cela.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- L'EMBED FERMÉ ---
        const embed = new EmbedBuilder()
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

        const bouton = new ButtonBuilder()
            .setCustomId('btn_candidater')
            .setLabel('Candidater')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true); 

        const row = new ActionRowBuilder().addComponents(bouton);

        const salonCibleId = '1487944471294513272';
        const salonCible = message.guild.channels.cache.get(salonCibleId);

        if (!salonCible) {
            const warning = await message.reply("❌ Impossible de trouver le salon cible. Vérifiez l'ID.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // Envoi du message
        await salonCible.send({ embeds: [embed], components: [row] });

        // Confirmation propre (et suppression après 5s)
        const success = await message.reply(`✅ Panneau envoyé avec succès dans <#${salonCibleId}> !`);
        setTimeout(() => { 
            success.delete().catch(()=>{}); 
            message.delete().catch(()=>{}); 
        }, 5000);
    }
};