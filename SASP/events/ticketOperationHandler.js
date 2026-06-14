const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // On ne réagit que si c'est un bouton ET que c'est le bouton du panel SUD
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'open_ticket_ops_sud') return;

        // La catégorie exacte que tu as demandée
        const categoryId = '1489685701443452949';

        await interaction.reply({ content: '⏳ Création de votre dossier en cours...', ephemeral: true });

        try {
            // 1. Création du salon ticket
            const ticketChannel = await interaction.guild.channels.create({
                name: `🔴-dossier-${interaction.user.username}`, // Prefixé avec "non traité" par défaut
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel], // Cache le salon à tout le monde
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages, 
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.CreatePublicThreads,
                            PermissionFlagsBits.SendMessagesInThreads
                        ], // Donne l'accès au créateur
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageThreads],
                    }
                ]
            });

            // 2. Le message d'instructions formaté
            const embedInstructions = new EmbedBuilder()
                .setTitle('📁 DOSSIER D\'OPÉRATION')
                .setColor('#E74C3C')
                .setDescription(`Bienvenue <@${interaction.user.id}>.\nEn ouvrant ce dossier, **vous vous désignez LEAD TERRAIN**, ce qui veut dire que vous en aurez l'entière responsabilité et devrez le traiter dans son intégralité.\n\n` +
                              `⚠️ **MERCI DE SUIVRE OBLIGATOIREMENT CE MODE DE FONCTIONNEMENT**\n\n` +
                              `🛠️ **Commandes de gestion d'un dossier :**\n` +
                              `\`/add\` : Ajouter une personne/grade spécifiquement sur un dossier (Exemple: LSPD)\n` +
                              `\`/rename [nom]\` : Renommer un dossier\n` +
                              `\`/transcript\` : Obtenir une archive de ce dossier dans 💾・𝘼𝙧𝙘𝙝𝙞𝙫𝙚𝙨\n` +
                              `\`/close\` : Fermer un dossier (*Archive OBLIGATOIRE avant clôture*)\n\n` +
                              `📊 **Statut d'un dossier (à modifier dans le nom) :**\n` +
                              `🟢 : Dossier validé par un supérieur, prêt a être fermé (Rapport fait)\n` +
                              `🔴 : Dossier non traité (Rapport non fait)\n` +
                              `🟠 : Opération toujours en cours\n` +
                              `🔵 : Dossier pour la G.N.D\n` +
                              `🟣 : Dossier pour la Crime\n` +
                              `🟡 : Convocations à faire\n` +
                              `⛔ : Ne pas fermer le dossier\n\n` +
                              `🧵 **Fils à ouvrir à la création d'un dossier :**\n` +
                              `🔹 Identités Suspects\n` +
                              `🔹 Identités Otages\n` +
                              `🔹 Photos\n` +
                              `🔹 Voitures/Plaques\n` +
                              `🔹 Unités`)
                .setFooter({ text: 'N\'oubliez pas de rename le dossier dès le début de l\'opération !' })
                .setTimestamp();

            await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embedInstructions] });

            // 3. Confirmation à l'utilisateur
            await interaction.editReply({ content: `✅ Votre dossier d'opération a été créé ici : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error("[ERREUR TICKET] :", error);
            await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création de la catégorie ou du salon. Vérifie mes permissions.' });
        }
    }
};