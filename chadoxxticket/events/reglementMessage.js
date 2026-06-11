const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.content === '!embeedreglement') {
            
            const adminRoleId = '1503490167963385998';
            if (!message.member.roles.cache.has(adminRoleId)) return;

            const targetChannelId = '1503490352143663256';
            const targetChannel = client.channels.cache.get(targetChannelId);
            
            if (!targetChannel) {
                return message.reply("❌ Erreur : Le salon du règlement est introuvable.");
            }

            const embed = new EmbedBuilder()
                .setColor('#2b2d31') 
                .setAuthor({ 
                    name: 'RÈGLEMENT OFFICIEL', 
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTitle('🌟 Bienvenue sur la communauté !')
                .setDescription(
                    "Avant de pouvoir accéder à l'intégralité des salons et discuter avec les autres membres, nous vous demandons de lire attentivement nos règles.\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "**1️⃣ Respect & Courtoisie**\n" +
                    "> Tout manque de respect, insulte, discrimination ou provocation est strictement interdit. Soyez bienveillants les uns envers les autres.\n\n" +
                    "**2️⃣ Contenu & Sécurité**\n" +
                    "> Le spam, le flood, la publicité non sollicitée (même en message privé) ainsi que tout contenu inapproprié (NSFW, illégal) entraîneront un bannissement.\n\n" +
                    "**3️⃣ Bon Sens & Équipe du Staff**\n" +
                    "> L'équipe de modération a le dernier mot. Si un membre du staff vous donne une directive, merci de la respecter. Le bon sens prime toujours.\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "🔓 **Comment débloquer votre accès ?**\n" +
                    "En cliquant sur le bouton **Accepter le règlement** ci-dessous, vous certifiez avoir lu et compris ces règles, et vous vous engagez à les respecter tout au long de votre aventure parmi nous."
                )
                .setFooter({ text: 'Validation requise pour continuer' })
                .setTimestamp();

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_rules')
                    .setLabel('Accepter le règlement')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
            );

            await targetChannel.send({ embeds: [embed], components: [button] });
            await message.delete().catch(() => {});
        }
    },
};