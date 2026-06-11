const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'embeedreglement',
    async execute(message, args) {
        const salonCommandeId = '1487830442324267079';
        if (message.channel.id !== salonCommandeId) {
            const warning = await message.reply(`❌ Cette commande doit être utilisée dans <#${salonCommandeId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        const roleAutoriseId = '1487829749345554543'; 
        if (!message.member.roles.cache.has(roleAutoriseId)) {
            const warning = await message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        const embedReglement = new EmbedBuilder()
            .setTitle('IrisFA | 📜 Règlement Discord & RP')
            .setColor('#E1C699') 
            .setDescription("Pour garantir une expérience agréable à tous, il est fortement recommandé de prendre connaissance du règlement, que ce soit sur Discord ou en jeu (RP), et de le respecter.\n\nL’ensemble des règles est disponible ici : **https://irisfa.netlify.app/rules**\n\nMerci à tous pour votre compréhension et bon jeu sur IrisFA ! 🚀")
            .setFooter({ text: 'Direction IrisFA | ✅ 0 personne a accepté' }) // LE COMPTEUR COMMENCE ICI
            .setTimestamp();

        const boutonAccepter = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_accepter_reglement')
                .setLabel('Accepter le règlement')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
        );

        const salonCibleId = '1487830047774740500';
        const salonCible = message.guild.channels.cache.get(salonCibleId);

        if (salonCible) {
            await salonCible.send({ embeds: [embedReglement], components: [boutonAccepter] });
            const success = await message.reply(`✅ Le règlement a été envoyé dans <#${salonCibleId}>.`);
            setTimeout(() => { success.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
        } else {
            message.reply("❌ Erreur : Le salon cible est introuvable.");
        }
    }
};