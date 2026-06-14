const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'open_ticket_ops_sud') return;

        const categoryId = '1489685701443452949';

        await interaction.reply({ content: '⏳ Création de votre dossier en cours...', ephemeral: true });

        try {
            // ✨ MODIFICATION : On prend le pseudo du serveur (ex: "41 | Jesse Langston") et on le nettoie pour Discord
            const safeName = interaction.member.displayName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase();

            // 1. Création du salon ticket (Sans le 🔴)
            const ticketChannel = await interaction.guild.channels.create({
                name: `dossier-${safeName}`,
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

            // 2. L'Embed des instructions (Plus court, plus propre, avec les "!")
            const embedInstructions = new EmbedBuilder()
                .setTitle('📁 DOSSIER D\'OPÉRATION')
                .setColor('#E74C3C') // Rouge SASP
                .setDescription(
                    `Bienvenue dans ce dossier d'opération.\n⚠️ **Vous êtes désigné LEAD TERRAIN.** Vous en avez l'entière responsabilité.\n\n` +
                    `**🛠️ Commandes de gestion :**\n` +
                    `\`!add\` • \`!rename [nom]\` • \`!transcript\` • \`!close\`\n\n` +
                    `**📊 Codes Statut (à modifier dans le nom) :**\n` +
                    `🟢 Traité | 🔴 Non traité | 🟠 En cours | 🔵 G.N.D | 🟣 Crime | 🟡 Convoc. | ⛔ Ne pas fermer\n\n` +
                    `**🧵 Fils à ouvrir :** Identités Suspects, Otages, Photos, Voitures, Unités.`
                )
                .setFooter({ text: 'N\'oubliez pas de rename le dossier dès le début de l\'opération !' });

            // 3. L'Embed du Modèle
            const embedTemplate = new EmbedBuilder()
                .setColor('#2980B9') // Bleu
                .setDescription(
                    `*Copiez le bloc ci-dessous pour votre rapport d'opération :*\n\`\`\`text\n` +
                    `╔════════════════════╗\n` +
                    `🚨 OPÉRATION 🚨\n` +
                    `╚════════════════════╝\n\n` +
                    `📅 Date / Heure :\n` +
                    `📍 Secteur :\n` +
                    `⚖️ Infraction :\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `👥 Suspects\n• \n• \n• \n\n` +
                    `🎭 Otages\n• \n• \n• \n\n` +
                    `🚗 Véhicules\n• \n• \n• \n\n` +
                    `📢 Revendications\n• \n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🎖️ Lead Terrain :\n🤝 Lead Négociations :\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `📝 Rapport d'Opération\n\n` +
                    `Décrivez précisément les faits, le déroulement de l'intervention et son dénouement...\n\n` +
                    `Compte-rendu :\n\`\`\``
                );

            // ✨ MODIFICATION : Le bouton de fermeture
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket_ops')
                    .setLabel('Fermer le dossier')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            // 4. Envoi du message global
            await ticketChannel.send({ 
                content: `📢 <@${interaction.user.id}> a ouvert un dossier d'opération !`, 
                embeds: [embedInstructions, embedTemplate],
                components: [row]
            });

            await interaction.editReply({ content: `✅ Votre dossier d'opération a été créé ici : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error("[ERREUR TICKET] :", error);
            await interaction.editReply({ content: '❌ Une erreur est survenue.' });
        }
    }
};