const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        // Le salon de bienvenue ciblé
        const welcomeChannelId = '1516530512917823488';
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

        if (!welcomeChannel) return;

        // --- DESIGN PREMIUM BIENVENUE ---
        const goldColor = '#d4af37';

        const welcomeEmbed = new EmbedBuilder()
            .setColor(goldColor)
            .setAuthor({ name: "Iris'Studio | Nouvel Arrivant", iconURL: member.guild.iconURL() })
            .setTitle('👋 BIENVENUE PARMI NOUS !')
            .setDescription(`Bienvenue <@${member.user.id}> sur le serveur !\n\n> 📜 **Étape 1 :** Nous t'invitons à lire et accepter le règlement pour débloquer l'accès complet au serveur.\n> \n> 🎫 **Étape 2 :** Si tu as besoin d'aide ou d'un service, n'hésite pas à ouvrir un ticket de support.`)
            // Affiche l'image de profil du nouveau membre en miniature
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `Tu es le ${member.guild.memberCount}ème membre !`, iconURL: member.guild.iconURL() })
            .setTimestamp();

        try {
            // Le "content" permet de mentionner le membre pour qu'il ait une notification rouge
            await welcomeChannel.send({ content: `<@${member.user.id}>`, embeds: [welcomeEmbed] });
        } catch (error) {
            console.error("Erreur lors de l'envoi du message de bienvenue :", error);
        }
    }
};