const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const audit = require('./auditLogs'); // Import du module de log

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'open_ticket_staff') return;

        const categoryId = '1515670134424080485';
        await interaction.reply({ content: '⏳ Ouverture de votre ticket...', ephemeral: true });

        try {
            const safeName = interaction.member.displayName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase();

            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${safeName}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { 
                        id: interaction.user.id, 
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
                    }
                ]
            });

            // ✨ LOG D'OUVERTURE
            audit.sendAuditLog(interaction.client, 'OPEN', {
                user: `<@${interaction.user.id}>`,
                channelName: ticketChannel.name,
                action: 'Ouverture d\'un ticket Staff'
            });

            const embed = new EmbedBuilder()
                .setTitle('🎫 SUPPORT STAFF - SASP')
                .setColor('#9a92c7')
                .setDescription(
                    `Bonjour, <@${interaction.user.id}>.\n\n` +
                    `Ce ticket est maintenant ouvert. Un membre de l'équipe du staff va prendre en charge votre demande dans les plus brefs délais.\n\n` +
                    `Pour rappel, ce support est destiné aux :\n` +
                    `• **Plaintes**\n` +
                    `• **Demandes administratives**\n` +
                    `• **Besoin d'un référent SASP / Haut gradé**\n\n` +
                    `Merci de détailler votre demande ci-dessous afin de faciliter le traitement de votre dossier.`
                )
                .setFooter({ text: 'SASP - Support Administratif' })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket_staff')
                    .setLabel('Fermer le ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
            await interaction.editReply({ content: `✅ Votre ticket a été créé ici : <#${ticketChannel.id}>` });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: '❌ Une erreur est survenue lors de la création du ticket.' });
        }
    }
};