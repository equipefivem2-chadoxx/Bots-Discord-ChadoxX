const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.content === '!embeedticket') {
            
            const adminRoleId = '1503490167963385998';
            if (!message.member.roles.cache.has(adminRoleId)) return;

            const targetChannelId = '1503490326831169696';
            const targetChannel = client.channels.cache.get(targetChannelId);
            
            if (!targetChannel) {
                return message.reply("❌ Erreur : Le salon cible est introuvable.");
            }

            // Nouveau design beaucoup plus propre
            const embed = new EmbedBuilder()
                .setTitle('📩 **Centre de Support**')
                .setDescription('Bienvenue sur notre système d\'assistance !\n\nSi vous avez la moindre question, un problème à signaler ou besoin d\'aide, notre équipe est là pour vous.\n\n> 💡 **Comment faire ?**\n> Cliquez simplement sur le bouton ci-dessous pour ouvrir un salon privé de communication.')
                .setColor('#2b2d31') // Couleur sombre et élégante qui se fond dans Discord
                .setFooter({ text: 'Support Technique' })
                .setTimestamp();

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Créer un ticket')
                    .setEmoji('🎫')
                    .setStyle(ButtonStyle.Secondary) // Bouton gris élégant
            );

            await targetChannel.send({ embeds: [embed], components: [button] });
            await message.delete().catch(() => {});
        }
    },
};