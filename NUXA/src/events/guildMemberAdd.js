const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        // Remplace par l'ID de ton salon #Arrive 🎀
        const welcomeChannelId = '1502295320607064204'; 
        
        const channel = member.guild.channels.cache.get(welcomeChannelId);

        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setTitle('✨ Nouvelle Arrivée !')
            .setDescription(`Bienvenue parmi nous <@${member.user.id}> ! 🎀\n\nOn est ravi de te compter dans la communauté de **Nuxa**. \nN'hésite pas à aller lire le règlement et à prendre tes rôles !`)
            .setColor('#FFB6C1') 
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Utilisateur', value: member.user.tag, inline: true },
                { name: '📈 Membres', value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: `Bienvenue sur le serveur de Nuxa !` })
            .setTimestamp();

        channel.send({ content: `Coucou <@${member.user.id}> ! 👋`, embeds: [welcomeEmbed] });
    },
};