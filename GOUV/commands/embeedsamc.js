const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'embeedsamc', // Toujours avec les deux "e" !
    description: 'Envoie l\'embed de présentation du SAMC avec bouton et logos',

    async execute(message, args, client) {
        // ID du salon SAMC
        const channelId = '1487837996307841286';
        const targetChannel = await client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply("❌ Impossible de trouver le salon. Vérifie l'ID.");
        }

        // --- GESTION DE L'IMAGE LOCALE (FIX BUFFER) ---
        const imagePath = path.join(__dirname, '../picture/samc.png');
        
        if (!fs.existsSync(imagePath)) {
            return message.reply("❌ Impossible de trouver l'image ! Vérifie qu'elle est bien dans `GOUV/picture/samc.png`.");
        }

        // On charge l'image en mémoire pour éviter les bugs d'affichage Discord
        const imageBuffer = fs.readFileSync(imagePath);
        const logoThumb = new AttachmentBuilder(imageBuffer, { name: 'samc_thumb.png' });
        const logoFoot = new AttachmentBuilder(imageBuffer, { name: 'samc_foot.png' });

        // --- CRÉATION DE L'EMBED ---
        const samcEmbed = new EmbedBuilder()
            .setColor('#8B1212') // Rouge Urgence
            .setTitle('🚑 SAN ANDREAS MEDICAL CENTER') // ✨ Modifié : CENTER
            .setDescription(
                `**“Care. Response. Excellence.”**\n\n` +
                `Le San Andreas Medical Center (SAMC) est l’institution principale chargée de la prise en charge médicale et des services de santé au sein de l’État de San Andreas. Elle a été créée le 11 février 2024 à la suite de la fusion du Los Santos Medical Center (LSMC) et du Blaine County Medical Center (BCMC), dans le but d’unifier et de moderniser le système de santé de l’État.\n\n` +
                `Placée sous la direction d’une équipe médicale expérimentée, le SAMC constitue aujourd’hui un acteur central du dispositif de secours et de soins. En coordination avec les services publics et les forces de l’ordre, elle assure une couverture médicale étendue sur l’ensemble du territoire, garantissant une prise en charge rapide et efficace des patients.\n\n` +
                `**ORGANISATION ET IMPLANTATION**\n` +
                `Le SAMC s’appuie sur plusieurs structures réparties stratégiquement afin de couvrir efficacement l’ensemble de l’État. Ses principaux établissements permettent une intervention aussi bien en zone urbaine dense qu’en secteur rural isolé.\n\n` +
                `Les centres médicaux principaux assurent les soins d’urgence, les consultations spécialisées ainsi que la gestion des patients nécessitant une prise en charge prolongée. Cette organisation permet d’assurer une continuité des soins sur l’ensemble du territoire de San Andreas.\n\n` +
                `**UNITÉS SPÉCIALISÉES**\n` +
                `Afin de répondre aux situations les plus critiques, le SAMC dispose de plusieurs unités spécialisées intervenant sur différents types de missions :\n\n` +
                `• Une unité aérienne dédiée au soutien et à l’évacuation médicale rapide\n` +
                `• Une unité de secours en zones difficiles d’accès\n` +
                `• Une unité de sauvetage maritime\n` +
                `• Une unité médicale tactique spécialisée dans les interventions à haut risque\n\n` +
                `Ces unités permettent d’assurer une réponse adaptée à des situations d’urgence variées, tout en maintenant un haut niveau de coordination avec les autres services de l’État.\n\n` +
                `**SERVICES MÉDICAUX**\n` +
                `Le SAMC propose une gamme complète de services médicaux afin de répondre aux besoins de la population :\n` +
                `Elle prend en charge les urgences vitales, la chirurgie, le suivi psychologique, les soins obstétriques, la médecine du travail, ainsi que la gestion médicale des événements publics. Elle dispose également d’un service spécialisé dans la gestion post-mortem.\n\n` +
                `Cette diversité de services permet d’assurer une prise en charge globale et continue des citoyens, allant de la prévention jusqu’aux soins les plus complexes.\n\n` +
                `**OBJECTIFS ET ENGAGEMENTS**\n` +
                `Le San Andreas Medical Center a pour mission principale d’assurer la santé et le bien-être de la population. Elle s’engage à améliorer en permanence la qualité des soins, à renforcer la réactivité de ses équipes et à développer des méthodes d’intervention toujours plus efficaces.\n\n` +
                `La formation continue du personnel, l’innovation médicale et la coordination avec les institutions publiques constituent les piliers de son fonctionnement.\n\n` +
                `Le SAMC demeure ainsi un acteur essentiel du système de santé de San Andreas, garantissant une prise en charge professionnelle, rapide et adaptée à chaque situation.`
            )
            .setThumbnail('attachment://samc_thumb.png') 
            .setFooter({ 
                text: 'Fire & Chief Supervisor | Thomas Marshall • San Andreas Medical Center', // ✨ Modifié : CENTER
                iconURL: 'attachment://samc_foot.png' 
            });

        // --- CRÉATION DU BOUTON ---
        const linkButton = new ButtonBuilder()
            .setLabel('Nous rejoindre')
            .setEmoji('🚑') 
            .setStyle(ButtonStyle.Link) 
            .setURL('https://discord.gg/PPxy9fCYm7'); 

        const row = new ActionRowBuilder().addComponents(linkButton);

        // --- ENVOI DU MESSAGE ---
        await targetChannel.send({ embeds: [samcEmbed], files: [logoThumb, logoFoot], components: [row] });
        
        await message.delete().catch(() => null);
        
        const confirmation = await message.channel.send(`✅ L'embed du San Andreas Medical Center a été posté !`);
        setTimeout(() => confirmation.delete().catch(() => null), 5000);
    }
};