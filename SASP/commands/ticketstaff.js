const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticketstaff',
    description: 'Déploie le panel de tickets Staff.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Tu n'as pas la permission.");
        }

        const channelId = '1515663813960138852'; 
        const targetChannel = message.client.channels.cache.get(channelId) || await message.client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) return message.reply(`❌ Salon introuvable.`);

        const embed = new EmbedBuilder()
            .setColor('#9a92c7') // La couleur demandée
            .setTitle('🎫 SUPPORT STAFF - SASP')
            .setDescription(
                'Bienvenue au support officiel du San Andreas State Police.\n\n' +
                'Ce canal est à votre disposition pour :\n' +
                '• **Déposer une plainte**\n' +
                '• **Faire une demande administrative**\n' +
                '• **Parler à un référent SASP / haut gradé**\n' +
                '• **Toute autre demande liée au pôle SASP**\n\n' +
                'Veuillez cliquer sur le bouton ci-dessous pour ouvrir votre dossier.'
            )
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'SASP - Support Administratif' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket_staff')
                .setLabel('Ouvrir un ticket Staff')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Secondary)
        );

        await targetChannel.send({ embeds: [embed], components: [row] });
        await message.reply(`✅ Panel Staff déployé avec succès dans <#${channelId}>.`);
    }
};