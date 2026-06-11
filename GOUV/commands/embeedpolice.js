const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'embeedpolice', 
    description: 'Envoie l\'embed de présentation de la SASP avec bouton et logos (Fix Buffer)',

    async execute(message, args, client) {
        const channelId = '1487837991849164960';
        const targetChannel = await client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply("❌ Impossible de trouver le salon. Vérifie l'ID.");
        }

        const imagePath = path.join(__dirname, '../picture/sasp.png');
        
        if (!fs.existsSync(imagePath)) {
            return message.reply("❌ Impossible de trouver l'image ! Vérifie qu'elle est bien dans `GOUV/picture/sasp.png`.");
        }

        // ✨ LA CORRECTION EST ICI : On charge l'image en mémoire (Buffer)
        const imageBuffer = fs.readFileSync(imagePath);
        
        // On crée les attachements à partir de la mémoire, et plus à partir du chemin
        const logoThumb = new AttachmentBuilder(imageBuffer, { name: 'sasp_thumb.png' });
        const logoFoot = new AttachmentBuilder(imageBuffer, { name: 'sasp_foot.png' });

        const policeEmbed = new EmbedBuilder()
            .setColor('#B3B9FF') 
            .setTitle('🚓 SAN ANDREAS STATE POLICE')
            .setDescription(
                `**“Protect. Serve. Enforce.”**\n\n` +
                `La San Andreas State Police (SASP) est une institution majeure chargée du maintien de l’ordre et de la sécurité publique sur l’ensemble du territoire de l’État de San Andreas. Elle intervient aussi bien en milieu urbain que rural afin de prévenir la criminalité, faire respecter la loi et assurer la protection des citoyens.\n\n` +
                `Placée sous l’autorité de l’État-Major, la SASP coordonne l’ensemble des opérations policières et garantit la bonne exécution des missions de sécurité intérieure. Ses responsabilités couvrent la lutte contre la criminalité organisée, la sécurité routière, les interventions d’urgence, les enquêtes criminelles ainsi que la protection des personnalités et des institutions.\n\n` +
                `**HISTORIQUE ET DÉVELOPPEMENT**\n` +
                `Les premières structures de maintien de l’ordre à San Andreas apparaissent à la fin du XIXe siècle, dans un contexte marqué par une forte instabilité dans les zones peu urbanisées. En 1869, les premières unités organisées sont officiellement mises en place afin de répondre à la montée de l’insécurité et structurer une présence policière sur le territoire.\n\n` +
                `Avec l’évolution de l’État et l’expansion des zones urbaines, l’organisation policière se modernise et se régionalise. Plusieurs postes et unités sont progressivement créés afin d’assurer une couverture efficace de l’ensemble du territoire, notamment dans les secteurs de Los Santos, Blaine County, Sandy Shores et La Mesa.\n\n` +
                `Le centre de commandement principal, situé à Los Santos, assure aujourd’hui la direction stratégique et opérationnelle de l’ensemble de la SASP.\n\n` +
                `**ORGANISATION GÉNÉRALE**\n` +
                `La SASP repose sur une structure hiérarchisée composée de plusieurs divisions spécialisées, permettant une gestion complète des missions de sécurité.\n\n` +
                `Les unités de patrouille constituent la base opérationnelle de la police. Elles assurent la présence sur le terrain, la prévention des infractions et les interventions rapides en cas d’incident.\n\n` +
                `Les unités d’investigation sont chargées des enquêtes approfondies, notamment sur les réseaux criminels organisés, les affaires graves et les activités illégales structurées.\n\n` +
                `Des unités spécialisées viennent renforcer ce dispositif, incluant notamment des équipes cynophiles dédiées à la détection de substances illicites et à la recherche de suspects, ainsi que des services scientifiques responsables de l’analyse des preuves matérielles, des scènes de crime et des éléments balistiques.\n\n` +
                `**MISSIONS ET PRIORITÉS**\n` +
                `La San Andreas State Police a pour mission principale d’assurer la sécurité des citoyens et la stabilité de l’État. Elle agit dans la prévention de la criminalité, la répression des infractions et le maintien de l’ordre public.\n\n` +
                `Une attention particulière est portée à la discipline, au professionnalisme et au respect strict des procédures. La formation continue des agents constitue un axe essentiel afin de garantir un niveau d’exigence élevé sur le terrain.\n\n` +
                `L’institution repose sur des valeurs fondamentales telles que l’intégrité, la rigueur et la responsabilité, visant à assurer une application juste et efficace de la loi sur l’ensemble du territoire.`
            )
            .setThumbnail('attachment://sasp_thumb.png') 
            .setFooter({ 
                text: 'Chief of Police | Madison Marshall • San Andreas State Police', 
                iconURL: 'attachment://sasp_foot.png' 
            });

        const linkButton = new ButtonBuilder()
            .setLabel('Nous rejoindre')
            .setEmoji('👮') 
            .setStyle(ButtonStyle.Link) 
            .setURL('https://discord.gg/n6UkHW9YFk'); 

        const row = new ActionRowBuilder().addComponents(linkButton);

        await targetChannel.send({ embeds: [policeEmbed], files: [logoThumb, logoFoot], components: [row] });
        
        await message.delete().catch(() => null);
        
        const confirmation = await message.channel.send(`✅ L'embed corrigé (Buffer) de la SASP a bien été posté !`);
        setTimeout(() => confirmation.delete().catch(() => null), 5000);
    }
};