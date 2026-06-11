const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bl',
    async execute(message, args) {
        // --- SÉCURITÉ SALON ---
        const salonCommandeId = '1489643979921297439';
        if (message.channel.id !== salonCommandeId) {
            const warning = await message.reply(`❌ Cette commande doit être utilisée dans <#${salonCommandeId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- SÉCURITÉ RÔLES ---
        // J'ai inclus les rôles de Direction + Recruteur
        const rolesAutorises = ['1489641130206298303', '1487833898150006956', '1487833901849120788', '1487833914268455105'];
        const possedeLeRole = rolesAutorises.some(roleId => message.member.roles.cache.has(roleId));
        
        if (!possedeLeRole) {
            const warning = await message.reply("❌ Vous n'avez pas la permission de gérer la liste noire.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- VÉRIFICATION DE L'ID ---
        const targetId = args[0];
        if (!targetId) {
            const warning = await message.reply("❌ Erreur : Vous devez spécifier l'ID Discord du joueur (ex: `!bl 123456789`).");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 8000);
            return;
        }

        // --- APPLICATION DE LA BLACKLIST ---
        try {
            const targetMember = await message.guild.members.fetch(targetId);
            const roleBlId = '1490176640058130452'; // Ton rôle Blacklist

            if (targetMember.roles.cache.has(roleBlId)) {
                // S'il l'a déjà, on lui retire (Unblacklist)
                await targetMember.roles.remove(roleBlId);
                await message.reply(`✅ Le joueur **${targetMember.user.tag}** a été **retiré** de la liste noire du SAMC.`);
            } else {
                // S'il ne l'a pas, on lui ajoute (Blacklist)
                await targetMember.roles.add(roleBlId);
                
                const embedBL = new EmbedBuilder()
                    .setTitle('🚫 | Blacklist SAMC')
                    .setColor('#000000') // Noir pour la blacklist
                    .setDescription(`Le citoyen <@${targetId}> a été placé sur liste noire.\nIl ne peut désormais plus soumettre de candidature pour rejoindre nos services.`)
                    .setFooter({ text: `Sanction appliquée par l'État Major SAMC` })
                    .setTimestamp();
                    
                await message.reply({ embeds: [embedBL] });
            }
        } catch (error) {
            const warning = await message.reply("❌ Erreur : Impossible de trouver un membre avec cet ID sur le serveur. Vérifiez qu'il est bien présent.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
        }
    }
};