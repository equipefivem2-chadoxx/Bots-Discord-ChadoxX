const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'testlive',
    async execute(message, args) {
        // Ta configuration
        const tiktokUsername = 'nunuxx._'; 
        const channelId = '1502296825749704775'; 
        const rolePingId = '1502295171759472700'; 

        const channel = message.client.channels.cache.get(channelId);

        if (!channel) {
            return message.reply('❌ Je ne trouve pas le salon d\'annonce !');
        }

        // On remonte au dossier des images
        const logoPath = path.join(__dirname, '../pictures/logo.png');
        const file = new AttachmentBuilder(logoPath, { name: 'logo.png' });

        const embed = new EmbedBuilder()
            .setTitle('🔴 [TEST] NUXA EST EN DIRECT SUR TIKTOK !')
            .setDescription(`Rejoignez le live maintenant !\n👉 **[Cliquez ici pour regarder le live](https://www.tiktok.com/@${tiktokUsername}/live)**`)
            .setColor('#FF0050') 
            .setThumbnail('attachment://logo.png')
            .setTimestamp();

        // Envoi dans le salon d'annonce
        await channel.send({ 
            content: `Coucou <@&${rolePingId}>, le live commence ! *(Ceci est un test)*`, 
            embeds: [embed],
            files: [file]
        });

        // Réponse dans le salon où tu as tapé !testlive
        await message.reply('✅ Simulation envoyée avec succès !');
    },
};