const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    name: 'embeedirs', // ✨ Toujours avec les deux "e" !
    description: 'Envoie l\'embed de l\'IRS avec le menu de recrutement financier',

    async execute(message, args, client) {
        // ID du salon Bureau IRS
        const channelId = '1487838009536811099';
        const targetChannel = await client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply("❌ Impossible de trouver le salon. Vérifie l'ID.");
        }

        // 1. Création de l'Embed Principal
        const irsEmbed = new EmbedBuilder()
            .setColor('#1B5E20') // ✨ Vert financier profond
            .setTitle('🏦 INTERNAL REVENUE SERVICE (IRS)')
            .setDescription(
                `**Administration fiscale de l’État de San Andreas**\n\n` +
                `L’Internal Revenue Service (IRS) est l’organisme chargé de l’application des lois fiscales et de la collecte des contributions financières obligatoires au sein des États-Unis. Placé sous l’autorité du Département du Trésor, il assure le bon fonctionnement du système fiscal et veille au respect des obligations déclaratives de chaque entité économique.\n\n` +
                `Dans l’État de San Andreas, une antenne locale de l’IRS opère sous la coordination des autorités étatiques afin d’adapter son action aux réalités économiques du territoire. Elle constitue un relais essentiel entre les institutions fédérales et les spécificités locales.\n\n` +
                `**MISSIONS PRINCIPALES**\n` +
                `L’IRS de San Andreas est responsable de la gestion complète du système fiscal sur son territoire. Ses missions incluent le traitement des déclarations fiscales, le recouvrement des sommes dues à l’État, ainsi que la réalisation de contrôles et d’audits visant à vérifier la conformité des situations fiscales.\n\n` +
                `L’agence intervient également dans la détection et la prévention des infractions financières, notamment les cas de fraude fiscale, de dissimulation de revenus ou de contournement des obligations légales.\n\n` +
                `**COOPÉRATION INTERINSTITUTIONNELLE**\n` +
                `L’IRS travaille en étroite collaboration avec les institutions financières et les agences gouvernementales. Cette coopération permet d’assurer une surveillance efficace des flux économiques et de lutter contre les activités financières illégales, telles que le blanchiment d’argent.\n\n` +
                `**ACCOMPAGNEMENT ET CONTRÔLE**\n` +
                `Au-delà de son rôle de contrôle, l’IRS assure également une mission d’accompagnement. Il met en place des dispositifs d’information afin de faciliter la compréhension et l’application des obligations fiscales.\n\n` +
                `**RÔLE AU SEIN DE L’ÉTAT**\n` +
                `L’IRS constitue un pilier essentiel de l’équilibre économique de San Andreas. En assurant la collecte des revenus publics, il participe directement au financement et au bon fonctionnement des institutions étatiques.`
            )
            .setFooter({ 
                text: 'Internal Revenue Service • San Andreas Department of the Treasury', 
                iconURL: client.user.displayAvatarURL() 
            });

        // 2. Création du Menu Déroulant (Option Unique)
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('menu_recrutement_irs')
            .setPlaceholder('💰 Postuler au Département des Finances') // ✨ Nouveau Placeholder
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Rejoindre l\'IRS (Internal Revenue Service)')
                    .setDescription('Gérez la fiscalité de l\'État, les audits financiers et le contrôle des taxes.')
                    .setEmoji('💰')
                    .setValue('irs_join')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 3. Envoi du message
        await targetChannel.send({ embeds: [irsEmbed], components: [row] });
        
        await message.delete().catch(() => null);
        
        const confirmation = await message.channel.send(`✅ L'embed de l'IRS a bien été posté dans <#${channelId}> !`);
        setTimeout(() => confirmation.delete().catch(() => null), 5000);
    }
};