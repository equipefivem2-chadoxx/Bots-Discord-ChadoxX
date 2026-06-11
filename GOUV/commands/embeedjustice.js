const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    name: 'embeedjustice', // Avec les deux "e" !
    description: 'Envoie l\'embed de présentation de la Justice avec le menu de recrutement',

    async execute(message, args, client) {
        // ID du salon Pôle Judiciaire
        const channelId = '1487837984974966906';
        const targetChannel = await client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply("❌ Impossible de trouver le salon. Vérifie l'ID.");
        }

        // 1. Création de l'Embed Principal
        const justiceEmbed = new EmbedBuilder()
            .setColor('#C5A059') // ✨ Une belle couleur Or/Laiton façon Palais de Justice
            .setTitle('⚖️ DÉPARTEMENT DE LA JUSTICE')
            .setDescription(
                `**Organisation judiciaire de l’État de San Andreas**\n` +
                `Le Département de la Justice de San Andreas constitue l’un des piliers fondamentaux des institutions étatiques. Placé sous l’autorité du Procureur Général, il a pour mission principale de garantir l’application des lois, d’assurer le bon fonctionnement du système judiciaire et de défendre les intérêts de l’État.\n\n` +
                `Le Département intervient à la fois dans la poursuite des infractions, la gestion des procédures judiciaires et la protection des droits fondamentaux des citoyens. Il veille également à ce que les actions menées par les forces de l’ordre respectent strictement le cadre légal en vigueur.\n\n` +
                `Par son rôle central, le Département de la Justice assure l’équilibre entre autorité publique et libertés individuelles, garantissant ainsi une justice équitable sur l’ensemble du territoire.\n\n` +
                `**LA COUR DE DISTRICT**\n` +
                `La Cour de district représente la juridiction principale de l’État de San Andreas. Elle est compétente pour traiter l’ensemble des affaires civiles et pénales relevant du droit étatique.\n\n` +
                `Elle intervient notamment dans les litiges entre particuliers, les affaires criminelles ainsi que les contentieux familiaux. La Cour est également chargée de statuer sur les sanctions, d’organiser les procès et de garantir le respect des procédures judiciaires.\n\n` +
                `Les juges exerçant au sein de cette juridiction sont sélectionnés avec rigueur, sur la base de leurs compétences juridiques, de leur expérience et de leur intégrité. Leur rôle est d’assurer une application impartiale de la loi, dans le respect des principes de justice.\n\n` +
                `**LE BUREAU DU PROCUREUR**\n` +
                `Le Bureau du Procureur, dirigé par le Procureur Général, est chargé de représenter l’État dans les affaires judiciaires et de conduire les poursuites pénales.\n\n` +
                `Il supervise les enquêtes en lien avec les forces de l’ordre, engage des procédures contre les auteurs d’infractions et veille à la bonne application des lois. Il intervient également dans certaines affaires civiles impliquant les intérêts de l’État.\n\n` +
                `Les procureurs sont recrutés selon des critères exigeants, incluant une formation juridique solide, une parfaite connaissance du droit et une conduite irréprochable.\n\n` +
                `**LE BARREAU DE SAN ANDREAS**\n` +
                `Le Barreau regroupe l’ensemble des avocats habilités à exercer au sein de l’État de San Andreas. Ces professionnels du droit jouent un rôle essentiel dans le bon fonctionnement du système judiciaire, en assurant la défense et le conseil des citoyens.\n\n` +
                `Dans le cadre de leurs fonctions, les avocats peuvent être désignés afin d’assurer la défense d’un individu ne disposant pas des moyens nécessaires pour se faire représenter. Cette mission garantit à chacun un accès équitable à la justice, conformément aux principes fondamentaux de l’État.\n\n` +
                `En parallèle, les avocats peuvent intervenir dans des affaires privées, qu’il s’agisse de conseils juridiques, de rédaction d’actes ou de représentation devant les juridictions compétentes. Leur objectif est d’accompagner leurs clients dans le respect strict du droit et des procédures en vigueur.`
            )
            .setFooter({ 
                text: 'Département de la Justice de San Andreas', 
                iconURL: client.user.displayAvatarURL() 
            });

        // 2. Création du Menu Déroulant
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('menu_recrutement_justice')
            .setPlaceholder('🏛️ Sélectionnez une carrière juridique...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Bureau du Procureur')
                    .setDescription('Représentez l\'État, dirigez les accusations et faites appliquer la loi pénale.')
                    .setEmoji('⚖️')
                    .setValue('justice_procureur'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Magistrature (Juge)')
                    .setDescription('Présidez les audiences, tranchez les litiges et garantissez l\'équité des procès.')
                    .setEmoji('👨‍⚖️')
                    .setValue('justice_juge'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Rejoindre le Barreau (Avocat)')
                    .setDescription('Défendez les droits de vos clients et assurez leur représentation devant la cour.')
                    .setEmoji('💼')
                    .setValue('justice_avocat'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Greffier / Assistant Juridique')
                    .setDescription('Gérez les archives du tribunal, rédigez les actes et assistez les magistrats.')
                    .setEmoji('📑')
                    .setValue('justice_greffier')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 3. Envoi du message
        await targetChannel.send({ embeds: [justiceEmbed], components: [row] });
        await message.delete().catch(() => null);
        
        const confirmation = await message.channel.send(`✅ L'embed de la Justice a bien été posté dans <#${channelId}> !`);
        setTimeout(() => confirmation.delete().catch(() => null), 5000);
    }
};