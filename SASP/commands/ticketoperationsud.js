const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticketoperationsud',
    description: 'Déploie le panel de création de dossier d\'opération SUD.',
    async execute(message, args) {
        // Sécurité : Uniquement pour les Administrateurs
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
        }

        // Le salon exact que tu as demandé
        const channelId = '1489685701443452950';
        const targetChannel = message.client.channels.cache.get(channelId) || await message.client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply(`❌ Impossible de trouver le salon avec l'ID ${channelId}.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#2980B9') // Bleu police/SASP
            .setTitle('🚓 BUREAU DES OPÉRATIONS - SUD')
            .setDescription('**Création d\'un nouveau dossier d\'opération**\n\nCliquez sur le bouton ci-dessous pour ouvrir un dossier dédié à votre intervention. \n\n⚠️ *Tout abus d\'ouverture de dossier sera sanctionné.*')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket_ops_sud')
                .setLabel('Ouvrir dossier d\'opération')
                .setEmoji('📂')
                .setStyle(ButtonStyle.Primary)
        );

        await targetChannel.send({ embeds: [embed], components: [row] });
        await message.channel.send(`✅ Panel déployé avec succès dans <#${channelId}> !`);
    }
};