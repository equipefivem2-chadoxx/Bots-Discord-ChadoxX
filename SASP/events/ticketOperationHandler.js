const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'open_ticket_ops_sud') return;

        const categoryId = '1489685701443452949';

        await interaction.reply({ content: '⏳ Création de votre dossier en cours...', ephemeral: true });

        try {
            // 1. Création du salon ticket
            const ticketChannel = await interaction.guild.channels.create({
                name: `🔴-dossier-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages, 
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.CreatePublicThreads,
                            PermissionFlagsBits.SendMessagesInThreads
                        ],
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageThreads],
                    }
                ]
            });

            // 2. L'Embed des instructions (Celui qu'on avait fait)
            const embedInstructions = new EmbedBuilder()
                .setTitle('📁 DOSSIER D\'OPÉRATION')
                .setColor('#E74C3C') // Rouge SASP
                .setDescription(`⚠️ **MERCI DE SUIVRE OBLIGATOIREMENT CE MODE DE FONCTIONNEMENT**\n\n` +
                              `🛠️ **Commandes de gestion d'un dossier :**\n` +
                              `\`/add\` : Ajouter une personne/grade spécifiquement sur un dossier (Exemple: LSPD)\n` +
                              `\`/rename [nom]\` : Renommer un dossier\n` +
                              `\`/transcript\` : Obtenir une archive de ce dossier dans 💾・𝘼𝙧𝙘𝙝𝙞𝙫𝙚𝙨\n` +
                              `\`/close\` : Fermer un dossier (*Archive OBLIGATOIRE avant clôture*)\n\n` +
                              `📊 **Statut d'un dossier (à modifier dans le nom) :**\n` +
                              `🟢 : Dossier traité, prêt a être fermé (Rapport fait)\n` +
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

            // 3. L'Embed du Modèle (Formaté pour être copié facilement)
            const embedTemplate = new EmbedBuilder()
                .setTitle('📝 MODÈLE À REMPLIR')
                .setColor('#2980B9') // Bleu
                .setDescription(
                    `*Copiez le bloc ci-dessous pour rédiger votre rapport d'opération :*\n\n` +
                    `\`\`\`text\n` +
                    `╔════════════════════╗\n` +
                    `🚨 OPÉRATION 🚨\n` +
                    `╚════════════════════╝\n\n` +
                    `📅 Date / Heure :\n` +
                    `📍 Secteur :\n` +
                    `⚖️ Infraction :\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `👥 Suspects\n` +
                    `• \n` +
                    `• \n` +
                    `• \n\n` +
                    `🎭 Otages\n` +
                    `• \n` +
                    `• \n` +
                    `• \n\n` +
                    `🚗 Véhicules\n` +
                    `• \n` +
                    `• \n` +
                    `• \n\n` +
                    `📢 Revendications\n` +
                    `• \n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🎖️ Lead Terrain :\n` +
                    `🤝 Lead Négociations :\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `📝 Rapport d'Opération\n\n` +
                    `Décrivez précisément les faits, le déroulement de l'intervention et son dénouement afin de permettre une compréhension complète de l'opération par toute personne consultant le dossier.\n\n` +
                    `Compte-rendu :\n` +
                    `\`\`\``
                );

            // 4. Le message complet envoyé dans le ticket (Le ping + les deux embeds)
            await ticketChannel.send({ 
                content: `📢 <@${interaction.user.id}> a ouvert un dossier d'opération !\n\nEn ouvrant ce dossier, **vous vous désignez LEAD TERRAIN**, ce qui veut dire que vous en aurez l'entière responsabilité et devrez le traiter dans son intégralité.`, 
                embeds: [embedInstructions, embedTemplate] 
            });

            // 5. Confirmation à l'utilisateur sur le bouton
            await interaction.editReply({ content: `✅ Votre dossier d'opération a été créé ici : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error("[ERREUR TICKET] :", error);
            await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création de la catégorie ou du salon. Vérifie mes permissions.' });
        }
    }
};