const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_select') return;

        const categories = {
            'achat': '1516530471994134568',
            'support': '1516530475760357406',
            'colab': '1516530478595833877',
            'autre': '1516743717598269500',
            'questions': '1516743777669091379'
        };

        const selectedCategory = categories[interaction.values[0]];

        if (!selectedCategory) {
            return interaction.reply({ content: "❌ Catégorie introuvable.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const staffRoleId = '1516530361511710730';

        try {
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: selectedCategory,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: staffRoleId, // Le staff voit le ticket
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ]
            });

            // --- DESIGN ÉPURÉ DU TICKET ---
            const goldColor = '#d4af37';
            const welcomeEmbed = new EmbedBuilder()
                .setColor(goldColor)
                .setAuthor({ name: "Iris'Studio | Support", iconURL: interaction.guild.iconURL() })
                .setDescription(`Bonjour <@${interaction.user.id}> et bienvenue dans ton ticket !\n\n> 📝 *Merci de détailler au maximum ta demande. Un membre de l'équipe te prendra en charge très rapidement.*\n\n⚠️ **Rappel :** Inutile de mentionner le staff, nous sommes déjà notifiés.`)
                .setFooter({ text: `Ticket créé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // --- BOUTON FERMER ---
            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Fermer le ticket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeButton);

            // Envoi de l'embed avec mention invisible (pour notifier le staff et le joueur)
            await channel.send({ 
                content: `||<@${interaction.user.id}> | <@&${staffRoleId}>||`, 
                embeds: [welcomeEmbed], 
                components: [row] 
            });

            await interaction.editReply({ content: `✅ Ton ticket a été créé avec succès : <#${channel.id}>` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "❌ Une erreur s'est produite lors de la création du ticket." });
        }
    }
};