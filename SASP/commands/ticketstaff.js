const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticketstaff',
    description: 'Déploie le panel de tickets Staff.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Tu n'as pas la permission.");
        }

        const channelId = '1515663813960138852'; // Salon Tickets Staff
        const targetChannel = message.client.channels.cache.get(channelId) || await message.client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) return message.reply(`❌ Salon introuvable.`);

        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🎫 SUPPORT STAFF - SASP')
            .setDescription('Besoin d\'aide ou d\'une intervention ?\nCliquez sur le bouton ci-dessous pour ouvrir un ticket.')
            .setThumbnail(message.guild.iconURL())
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket_staff')
                .setLabel('Ouvrir un ticket Staff')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Secondary)
        );

        await targetChannel.send({ embeds: [embed], components: [row] });
        await message.reply(`✅ Panel Staff déployé dans <#${channelId}>.`);
    }
};