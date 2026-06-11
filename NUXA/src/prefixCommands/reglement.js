const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'reglement',
    async execute(message, args) {
        // Sécurité : Seuls les gérants du serveur peuvent envoyer le règlement
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
        }

        const channelId = '1502295331323383818';
        const channel = message.client.channels.cache.get(channelId);

        if (!channel) return message.reply("❌ Salon du règlement introuvable !");

        const embed = new EmbedBuilder()
            .setTitle('📜 Règlement de la Communauté Nuxa')
            .setDescription(`Bienvenue sur le serveur ! 🎀\nPour que tout se passe au mieux, merci de lire et d'accepter ces quelques règles avant de rejoindre la communauté :\n\n` +
            `**1️⃣ Le Respect avant tout**\nSoyez bienveillants. Aucune insulte, moquerie, discrimination ou harcèlement ne sera toléré.\n\n` +
            `**2️⃣ Pas de contenu inapproprié (NSFW)**\nCe serveur est tout public. Les images, vidéos ou propos choquants sont strictement interdits.\n\n` +
            `**3️⃣ Pas de Spam ni de Pub**\nNe spammez pas les salons (mentions inutiles, messages à répétition) et ne faites pas de publicité pour d'autres serveurs ou réseaux sans l'accord du staff.\n\n` +
            `**4️⃣ Suivez les directives du Staff**\nL'équipe de modération est là pour veiller à la bonne ambiance. Leurs décisions sont finales. Si vous avez un souci, utilisez le système de tickets.\n\n` +
            `**5️⃣ L'esprit TikTok**\nOn est là pour s'amuser, partager autour des lives de Nuxa et chill ensemble ! Gardez votre bonne humeur. ✨\n\n` +
            `*Cliquez sur le bouton ci-dessous pour valider la lecture et obtenir votre accès au reste du serveur !*`)
            .setColor('#fc78f3') // Le beau rose
            .setThumbnail(message.guild.iconURL({ dynamic: true })) // Met automatiquement l'icône de ton serveur
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('accept_rules')
                .setLabel('✅ Accepter le règlement')
                .setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [row] });
        await message.reply('✅ Règlement envoyé avec succès dans le salon !');
    },
};