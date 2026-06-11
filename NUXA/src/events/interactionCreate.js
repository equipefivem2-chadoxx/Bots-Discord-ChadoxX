const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        // --- CONFIGURATION ---
        const categoryId = '1502301350678237204'; // Catégorie des tickets
        const modRoleId = '1502295129388748820';   // Rôle Modérateur
        const logsChannelId = '1502314490782285955'; // Salon des logs

        const logChannel = interaction.guild.channels.cache.get(logsChannelId);

        // OUVERTURE DU TICKET
        if (interaction.customId === 'open_ticket') {
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                parent: categoryId,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // Cache pour tout le monde
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }, // L'utilisateur
                    { id: modRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }, // Les Modos
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle('🌸 Support Nuxa')
                .setDescription(`Bienvenue dans ton ticket privé <@${interaction.user.id}> !\n\nN'hésite pas à nous expliquer en détail la raison de ta demande. Un membre de l'équipe viendra te répondre dès que possible.\n\nMerci de patienter ! 💖`)
                .setColor('#fc78f3');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Danger)
            );

            // On mentionne uniquement l'utilisateur qui a ouvert le ticket
            await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
            await interaction.reply({ content: `✅ Ticket créé : ${channel}`, ephemeral: true });

            // LOG : Création
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🎫 Ticket Ouvert')
                    .addFields(
                        { name: 'Utilisateur', value: `${interaction.user.tag} (${interaction.user.id})` },
                        { name: 'Salon', value: `${channel.name}` }
                    )
                    .setColor('#2ecc71').setTimestamp();
                logChannel.send({ embeds: [logEmbed] });
            }
        }

        // FERMETURE (DEMANDE DE SUPPRESSION)
        if (interaction.customId === 'close_ticket') {
            // SÉCURITÉ : Vérifie si le membre a le rôle Modérateur
            if (!interaction.member.roles.cache.has(modRoleId)) {
                return interaction.reply({ content: "❌ Seul le staff peut fermer ce ticket.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setDescription('Le ticket va être fermé. Supprimer définitivement ?')
                .setColor('#fc78f3');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('delete_ticket').setLabel('Supprimer').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({ embeds: [embed], components: [row] });

            // LOG : Fermeture
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🔒 Ticket Fermé')
                    .setDescription(`Ticket de ${interaction.channel.name} fermé par ${interaction.user.tag}`)
                    .setColor('#f1c40f').setTimestamp();
                logChannel.send({ embeds: [logEmbed] });
            }
        }

        // SUPPRESSION FINALE
        if (interaction.customId === 'delete_ticket') {
            // SÉCURITÉ : Vérifie si le membre a le rôle Modérateur (au cas où)
            if (!interaction.member.roles.cache.has(modRoleId)) {
                return interaction.reply({ content: "❌ Seul le staff peut supprimer ce ticket.", ephemeral: true });
            }

            // LOG : Suppression
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🗑️ Ticket Supprimé')
                    .setDescription(`Le salon \`${interaction.channel.name}\` a été supprimé par ${interaction.user.tag}`)
                    .setColor('#e74c3c').setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

            await interaction.reply('Suppression en cours...');
            setTimeout(() => interaction.channel.delete(), 2000);
        }
    },
};