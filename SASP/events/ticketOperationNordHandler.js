const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'open_ticket_ops_nord') return; // Écoute uniquement le bouton NORD

        const categoryId = '1515658721609646183'; // Catégorie NORD

        await interaction.reply({ content: '⏳ Création de votre dossier en cours...', ephemeral: true });

        try {
            const safeName = interaction.member.displayName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase();

            const ticketChannel = await interaction.guild.channels.create({
                name: `dossier-${safeName}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { 
                        id: interaction.user.id, 
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.SendMessagesInThreads] 
                    },
                    { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageThreads] }
                ]
            });

            const embedInstructions = new EmbedBuilder()
                .setTitle('📁 DOSSIER D\'OPÉRATION (NORD)')
                .setColor('#E74C3C')
                .setDescription(
                    `Bienvenue dans ce dossier d'opération.\n⚠️ **A la fin vous devez le remplir dans son intégralité.** Vous en avez l'entière responsabilité.\n\n` +
                    `**🛠️ Commandes de gestion :**\n` +
                    `\`!add\` • \`!rename [nom]\` • \`!transcript\` • \`!close\`\n\n` +
                    `**📊 Codes Statut (à modifier dans le nom) :**\n` +
                    `🟢 Traité | 🔴 Non traité | 🟠 En cours | 🟡 Convoc.| ⛔ Ne pas fermer\n\n` +
                    `**🧵 Fils à ouvrir :** Identités Suspects, Otages, Photos, Voitures, Unités.`
                )
                .setFooter({ text: 'N\'oubliez pas de rename le dossier dès le début de l\'opération !' });

            const embedTemplate = new EmbedBuilder()
                .setColor('#2980B9')
                .setDescription(
                    `*Copiez le bloc ci-dessous pour votre rapport d'opération :*\n\`\`\`text\n` +
                    `╔════════════════════╗\n🚨 OPÉRATION 🚨\n╚════════════════════╝\n\n` +
                    `📅 Date / Heure :\n📍 Secteur :\n⚖️ Infraction :\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `👥 Suspects\n• \n• \n• \n\n🎭 Otages\n• \n• \n• \n\n🚗 Véhicules\n• \n• \n• \n\n📢 Revendications\n• \n\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🎖️ Lead Terrain :\n🤝 Lead Négociations :\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `📝 Rapport d'Opération\n\nDécrivez précisément les faits...\n\nCompte-rendu :\n\`\`\``
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket_ops_nord') // Bouton de fermeture unique au NORD
                    .setLabel('Fermer le dossier')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ 
                content: `📢 <@${interaction.user.id}> a ouvert un dossier d'opération !`, 
                embeds: [embedInstructions, embedTemplate],
                components: [row]
            });

            await interaction.editReply({ content: `✅ Votre dossier d'opération NORD a été créé ici : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Une erreur est survenue.' });
        }
    }
};