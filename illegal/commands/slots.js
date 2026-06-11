const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Modifier les slots disponibles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const allowedRoles = [
            '1487832660238794893',
            '1487832656040427633'
        ];

        const hasRole = interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasRole) {

            return interaction.reply({
                content: '❌ Tu n’as pas la permission.',
                ephemeral: true
            });

        }

        const button = new ButtonBuilder()
            .setCustomId('edit_slots')
            .setLabel('Modifier les slots')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await interaction.reply({
            content: '🎯 Gestion des slots',
            components: [row],
            ephemeral: true
        });

    },

    async button(interaction) {

        if (interaction.customId !== 'edit_slots') return;

        const modal = new ModalBuilder()
            .setCustomId('slots_modal')
            .setTitle('Modifier les slots');

        const remainingInput = new TextInputBuilder()
            .setCustomId('remaining')
            .setLabel('Slots restants')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Exemple : 3');

        const totalInput = new TextInputBuilder()
            .setCustomId('total')
            .setLabel('Slots totaux')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Exemple : 5');

        const row1 = new ActionRowBuilder().addComponents(remainingInput);
        const row2 = new ActionRowBuilder().addComponents(totalInput);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);

    },

    async modal(interaction) {

        if (interaction.customId !== 'slots_modal') return;

        const remaining = interaction.fields.getTextInputValue('remaining');
        const total = interaction.fields.getTextInputValue('total');

        const channel = interaction.guild.channels.cache.get('1487833104956784921');

        if (!channel) {

            return interaction.reply({
                content: '❌ Salon introuvable.',
                ephemeral: true
            });

        }

        // 🔎 Cherche le message embed
        const messages = await channel.messages.fetch({ limit: 20 });

        const targetMessage = messages.find(msg =>
            msg.author.id === interaction.client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title?.includes('Création d’un Groupe Officiel')
        );

        if (!targetMessage) {

            return interaction.reply({
                content: '❌ Embed introuvable.',
                ephemeral: true
            });

        }

        const oldEmbed = targetMessage.embeds[0];

        const embed = EmbedBuilder.from(oldEmbed);

        embed.spliceFields(4, 1, {
            name: '════════════════════',
value:
`🎯 **SLOTS DISPONIBLES**

**${remaining}/${total}**`,
            inline: false
        });

        await targetMessage.edit({
            embeds: [embed]
        });

        await interaction.reply({
            content: `✅ Slots mis à jour : ${remaining}/${total}`,
            ephemeral: true
        });

    }

};