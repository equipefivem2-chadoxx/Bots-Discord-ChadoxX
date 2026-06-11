const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'setup-ticket',
    async execute(message, args) {
        // ID du rôle autorisé à configurer le système
        const adminRoleId = '1502295098560352509';

        if (!message.member.roles.cache.has(adminRoleId)) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
        }

        const setupChannelId = '1502295356187218041';
        const channel = message.client.channels.cache.get(setupChannelId);
        if (!channel) return message.reply("❌ Salon de setup introuvable !");

        const logoPath = path.join(__dirname, '../pictures/logo.png');
        const file = new AttachmentBuilder(logoPath, { name: 'logo.png' });

        const embed = new EmbedBuilder()
            .setTitle('📩 Centre d\'Aide & Support')
            .setDescription(`Coucou ! 👋 Tu as besoin d'aide, tu as une question, ou un problème à signaler ? L'équipe de modération est là pour toi.\n\nClique simplement sur le bouton juste en dessous pour ouvrir un ticket privé avec le staff.\n\n⚠️ **Inutile de mentionner le staff, nous recevons une notification automatique !**`)
            .setColor('#fc78f3')
            .setThumbnail('attachment://logo.png');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Ouvrir un ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Secondary)
        );

        await channel.send({ embeds: [embed], components: [row], files: [file] });
        await message.reply('✅ Système de ticket envoyé et sécurisé !');
    },
};