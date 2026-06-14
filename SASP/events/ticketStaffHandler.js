const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'open_ticket_staff') return;

        const categoryId = '1515670134424080485'; // Catégorie Staff
        await interaction.reply({ content: '⏳ Ouverture du ticket...', ephemeral: true });

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { 
                        id: interaction.user.id, 
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
                    }
                    // Tu pourras ajouter ici un rôle staff spécifique avec .allow(PermissionFlagsBits.ViewChannel)
                ]
            });

            const embed = new EmbedBuilder()
                .setTitle('🎫 Ticket Staff')
                .setDescription('Expliquez votre problème, un membre du staff vous répondra rapidement.');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket_staff')
                    .setLabel('Fermer le ticket')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
            await interaction.editReply({ content: `✅ Ticket créé : <#${ticketChannel.id}>` });
        } catch (e) {
            await interaction.editReply({ content: '❌ Erreur.' });
        }
    }
};