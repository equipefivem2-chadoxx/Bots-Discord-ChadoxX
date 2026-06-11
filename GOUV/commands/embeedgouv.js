const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    name: 'embeedgouv', // Avec les deux "e" !
    description: 'Envoie l\'embed de présentation du Gouvernement avec le menu de recrutement',

    async execute(message, args, client) {
        const channelId = '1487837980130279494';
        const targetChannel = await client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply("❌ Impossible de trouver le salon. Vérifie l'ID.");
        }

        // 1. Création de l'Embed Principal avec une nouvelle couleur
        const gouvEmbed = new EmbedBuilder()
            .setColor('#722F37') // ✨ Changé pour un Rouge Bordeaux très institutionnel !
            .setTitle('🏛️ GOUVERNEMENT DE SAN ANDREAS')
            .setDescription(
                `**Organisation du pouvoir exécutif**\n` +
                `Le Gouverneur de l’État de San Andreas incarne l’autorité exécutive suprême. À ce titre, il est garant du bon fonctionnement des institutions publiques, de l’application des lois et de la stabilité générale de l’État.\n\n` +
                `Nommé ou élu selon les dispositions en vigueur, le Gouverneur exerce ses fonctions en collaboration avec un Cabinet composé de responsables chargés de différents secteurs stratégiques. Ensemble, ils assurent la gestion quotidienne de l’État et veillent à la mise en œuvre des politiques publiques.\n\n` +
                `Le rôle du Gouverneur s’articule autour de deux missions principales. D’une part, il définit les orientations politiques et prend part aux décisions majeures concernant l’avenir de l’État. D’autre part, il supervise l’exécution des lois et s’assure du bon fonctionnement des services administratifs.\n\n` +
                `Dans le cadre de ses fonctions, il dispose d’un pouvoir de validation sur les textes proposés par les instances législatives. Il peut également s’opposer à certaines mesures si celles-ci ne correspondent pas aux intérêts de l’État ou de sa population.\n\n` +
                `**LE CABINET EXÉCUTIF**\n` +
                `Le Cabinet du Gouverneur regroupe l’ensemble des responsables administratifs et politiques placés sous son autorité directe. Chaque membre du Cabinet est chargé d’un domaine spécifique et participe activement à la gestion de l’État.\n\n` +
                `Les responsables de services ont pour mission d’appliquer les directives gouvernementales, d’encadrer leurs équipes et d’assurer la continuité des services publics. Ils rendent compte directement au Gouverneur, garantissant ainsi une chaîne de commandement claire et efficace.\n\n` +
                `Le Cabinet joue également un rôle essentiel dans l’analyse des situations, la proposition de réformes et la gestion des crises. Il constitue un organe central dans la prise de décision et l’adaptation constante de l’État aux enjeux actuels.\n\n` +
                `**RÔLE INSTITUTIONNEL ET REPRÉSENTATION**\n` +
                `Au-delà de ses fonctions internes, le Gouverneur représente officiellement l’État de San Andreas. Il intervient dans les relations avec les institutions publiques, les organisations privées ainsi que les différents acteurs du territoire.\n\n` +
                `Il assure également un lien direct avec la population, en veillant à prendre en compte les besoins, les préoccupations et les attentes des citoyens. Cette proximité permet d’adapter les décisions politiques à la réalité du terrain.\n\n` +
                `**CRÉATION ET GESTION D’ENTREPRISE**\n` +
                `L’État de San Andreas encourage l’initiative économique et offre la possibilité à tout individu de créer ou de reprendre une entreprise.\n` +
                `Toute demande doit faire l’objet d’un dossier structuré, présenté sous format numérique (type présentation). Ce dossier devra obligatoirement contenir les éléments suivants :\n\n` +
                `• Une présentation générale du projet\n` +
                `• Une description détaillée de l’activité envisagée\n` +
                `• Les objectifs de développement\n` +
                `• Les expériences ou compétences liées à la gestion\n\n` +
                `Une attention particulière sera portée à la qualité du dossier. Les candidatures devront démontrer une grande qualité, une vision claire et une capacité à s’intégrer dans l’économie de l’État.\n` +
                `Les demandes sont étudiées avec rigueur, et seules les propositions sérieuses et abouties seront retenues.`
            )
            .setFooter({ 
                text: 'Gouvernement de San Andreas • Administration', 
                iconURL: client.user.displayAvatarURL() 
            });

        // 2. Création du Menu Déroulant
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('menu_recrutement_gouv')
            .setPlaceholder('🏛️ Sélectionnez le pôle souhaité...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Pôle Administratif & Secrétariat')
                    .setDescription('Postulez en tant que secrétaire, assistant ou consultant d\'État.')
                    .setEmoji('💼')
                    .setValue('gouv_admin'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Bureau des Affaires Civiles')
                    .setDescription('Gestion des créations d\'entreprises, événementiel et accompagnement.')
                    .setEmoji('🤝')
                    .setValue('gouv_civil'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Ministère de la Santé Publique')
                    .setDescription('Coordination médicale, prévention et développement du réseau sanitaire.')
                    .setEmoji('⚕️')
                    .setValue('gouv_sante'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Département de la Sécurité Intérieure')
                    .setDescription('Protection des citoyens, maintien de l\'ordre et collaboration durable.')
                    .setEmoji('🛡️')
                    .setValue('gouv_securite'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Candidature Spontanée')
                    .setDescription('Le poste que vous visez n\'est pas listé ? Soumettez votre dossier libre.')
                    .setEmoji('📩')
                    .setValue('gouv_autre')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 3. Envoi du message
        await targetChannel.send({ embeds: [gouvEmbed], components: [row] });
        await message.delete().catch(() => null);
        
        const confirmation = await message.channel.send(`✅ L'embed du Gouvernement a bien été posté dans <#${channelId}> !`);
        setTimeout(() => confirmation.delete().catch(() => null), 5000);
    }
};