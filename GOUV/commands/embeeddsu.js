const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    name: 'embeeddsu', // ✨ Avec les deux "e" comme d'habitude !
    description: 'Envoie l\'embed de la D.S.U avec le menu de recrutement',

    async execute(message, args, client) {
        // ID du salon Agence DSU
        const channelId = '1487838001022238820';
        const targetChannel = await client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply("❌ Impossible de trouver le salon. Vérifie l'ID.");
        }

        // 1. Création de l'Embed Principal
        const dsuEmbed = new EmbedBuilder()
            .setColor('#1A1A1B') // ✨ Gris Anthracite Elite
            .setTitle('🛡️ DIPLOMATIC SECURITY UNIT (D.S.U)')
            .setDescription(
                `**Unité de Sécurité Diplomatique**\n\n` +
                `La Diplomatic Security Unit (D.S.U) est une unité d’élite placée sous l’autorité directe du Gouverneur de l’État de San Andreas. Elle est chargée de la protection des institutions gouvernementales, des infrastructures sensibles et des représentants de l’État sur l’ensemble du territoire.\n\n` +
                `Sa mission principale est d’assurer la continuité et l’intégrité de l’appareil étatique en prévenant, anticipant et neutralisant toute menace pouvant compromettre la sécurité des autorités publiques ou le bon fonctionnement des institutions.\n\n` +
                `**MISSIONS OPÉRATIONNELLES**\n` +
                `La D.S.U intervient dans un large éventail de situations liées à la sécurité institutionnelle. Ses missions incluent notamment la protection rapprochée des personnalités officielles, l’escorte de convois sensibles, la sécurisation de sites gouvernementaux, ainsi que la mise en place de dispositifs de sécurité lors d’événements publics à risque.\n\n` +
                `Elle peut également être déployée en intervention sur zone lorsqu’une menace directe est identifiée contre une institution, une autorité ou un intérêt stratégique de l’État.\n\n` +
                `**RECRUTEMENT ET FORMATION**\n` +
                `L’intégration au sein de la D.S.U repose sur un processus de sélection strict et exigeant. Les candidats retenus suivent ensuite une formation interne spécialisée visant à garantir un haut niveau de compétence opérationnelle.\n\n` +
                `Cette formation comprend des modules portant sur la protection rapprochée, les techniques de tir, la conduite tactique, la gestion de crise ainsi que les procédures d’intervention en situation de menace élevée. Les agents sont tenus de maintenir un niveau constant de discipline et de réactivité.\n\n` +
                `**ORGANISATION INTERNE**\n` +
                `La D.S.U est structurée en plusieurs unités spécialisées afin d’optimiser l’efficacité opérationnelle. Chaque brigade est dédiée à un domaine précis, tel que l’escorte motorisée, la protection statique, la reconnaissance ou encore le déploiement mobile.\n\n` +
                `**ÉQUIPEMENTS ET CAPACITÉS**\n` +
                `Les agents disposent d’un équipement spécialisé adapté aux missions à haut risque : protections renforcées, armements de pointe, véhicules blindés et moyens de communication sécurisés.\n\n` +
                `**IDENTITÉ DE L’UNITÉ**\n` +
                `La D.S.U incarne la protection discrète mais essentielle de l’État. Elle agit dans l’ombre des institutions, là où la menace devient stratégique. Son rôle est clair : préserver la stabilité des pouvoirs publics et garantir la continuité de l’État en toutes circonstances.`
            )
            .setFooter({ 
                text: 'Diplomatic Security Unit • État de San Andreas', 
                iconURL: client.user.displayAvatarURL() 
            });

        // 2. Création du Menu Déroulant (Option Unique)
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('menu_recrutement_dsu')
            .setPlaceholder('🗽 Intégrer le département DSU') // ✨ Nouveau Placeholder
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Déposer une candidature')
                    .setDescription('Accédez au formulaire officiel pour rejoindre nos équipes de terrain.')
                    .setEmoji('📋')
                    .setValue('dsu_join')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 3. Envoi du message
        await targetChannel.send({ embeds: [dsuEmbed], components: [row] });
        
        await message.delete().catch(() => null);
        
        const confirmation = await message.channel.send(`✅ L'embed de la D.S.U a bien été posté dans <#${channelId}> !`);
        setTimeout(() => confirmation.delete().catch(() => null), 5000);
    }
};