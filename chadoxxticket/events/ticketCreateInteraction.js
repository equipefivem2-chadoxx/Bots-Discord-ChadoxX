const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // On s'assure que c'est un bouton et que c'est NOTRE bouton
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'create_ticket') return;

        const categoryId = '1503490301715677184';
        const staffRoleId = '1503490205276045433';

        // On fait patienter Discord pour éviter que l'interaction expire
        await interaction.deferReply({ ephemeral: true });

        try {
            // Création du salon de ticket
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel], // Personne ne le voit
                    },
                    {
                        id: interaction.user.id, // L'utilisateur
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: staffRoleId, // Le rôle Staff
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                ],
            });

            // L'embed d'accueil DANS le ticket - NOVEAU DESIGN
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2b2d31') // Même couleur pro et sobre
                .setTitle('🎫 **Ticket d\'Assistance Ouvert**')
                .setDescription(`Merci d'avoir ouvert un ticket, ${interaction.user} !\nVotre demande est maintenant prise en charge par notre équipe.`)
                .addFields(
                    { name: '👤 Utilisateur', value: `${interaction.user}`, inline: true },
                    { name: '🛠️ Équipe de Support', value: `<@&${staffRoleId}>`, inline: true },
                    { 
                        name: '📜 Instructions', 
                        value: `> 💡 **En attendant :**\n> Décrivez votre problème ou votre question de manière détaillée pour nous aider à vous répondre plus rapidement.` 
                    }
                )
                .setFooter({ text: 'Support Technique' })
                .setTimestamp();

            // Bouton pour fermer le ticket (que l'on gérera plus tard pour les logs)
            const closeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Fermer le ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            // On ping l'utilisateur et le staff invisiblement via le content du message
            await channel.send({ 
                content: `${interaction.user} | <@&${staffRoleId}>`, 
                embeds: [welcomeEmbed], 
                components: [closeButton] 
            });

            // On confirme à l'utilisateur que c'est bon
            await interaction.editReply({ content: `✅ Ton ticket a été créé avec succès : ${channel}` });

        } catch (error) {
            console.error("Erreur lors de la création du ticket :", error);
            await interaction.editReply({ content: "❌ Une erreur est survenue lors de la création du ticket." });
        }
    },
};