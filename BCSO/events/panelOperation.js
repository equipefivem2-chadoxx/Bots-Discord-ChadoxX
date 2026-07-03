// BCSO/events/panelOperation.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js'); // On importe la config pour la couleur et le logo

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Commande pour faire spawn le panel (réservée aux admins)
        if (message.content === '!embedopération' && message.member.permissions.has('Administrator')) {
            
            const embed = new EmbedBuilder()
                .setAuthor({ name: "🚓 BUREAU DES OPÉRATIONS - BCSO" })
                .setTitle("Création d'un nouveau dossier d'opération")
                .setDescription("Cliquez sur le bouton ci-dessous pour ouvrir un dossier dédié à votre intervention.\n\n⚠️ *Tout abus d'ouverture de dossier sera sanctionné.*")
                .setColor(config.embedColor) // Utilise le beige défini dans la config
                .setThumbnail(config.logoUrl) // Place le logo en haut à droite comme sur ta photo
                .setTimestamp(); // Ajoute la date et l'heure actuelles en bas

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_op_ticket') // C'est cet ID qui fera réagir l'autre fichier (openTicket.js)
                    .setLabel("Ouvrir dossier d'opération")
                    .setEmoji('📁')
                    .setStyle(ButtonStyle.Primary) // Bouton bleu (Primary) ou gris (Secondary)
            );

            // Envoie l'embed dans le salon où tu as tapé la commande
            await message.channel.send({ embeds: [embed], components: [row] });
            
            // Supprime ton message "!embedopération" pour laisser le salon propre
            await message.delete().catch(() => {}); 
        }
    });
};