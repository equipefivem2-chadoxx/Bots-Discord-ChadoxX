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
        .setName('hotfix')
        .setDescription('Publier un hotfix'),

    async execute(interaction) {

        // 🔒 Rôles autorisés
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

        // 🔘 Bouton
        const button = new ButtonBuilder()
            .setCustomId('hotfix_create')
            .setLabel('Créer un hotfix')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await interaction.reply({
            content: 'Gestion des hotfix',
            components: [row],
            ephemeral: true
        });

    },

    // =========================
    // 🔘 Bouton
    // =========================
    async button(interaction) {

        if (interaction.customId !== 'hotfix_create') return;

        const modal = new ModalBuilder()
            .setCustomId('hotfix_modal')
            .setTitle('Créer un hotfix');

        // 📅 Date
        const dateInput = new TextInputBuilder()
            .setCustomId('date')
            .setLabel('Date du hotfix')
            .setPlaceholder('Exemple : 10.02.25')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // 📂 Catégorie
        const categoryInput = new TextInputBuilder()
            .setCustomId('category')
            .setLabel('Catégorie')
            .setPlaceholder('Exemple : :gun: Fusillades')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // 📝 Contenu
        const contentInput = new TextInputBuilder()
            .setCustomId('content')
            .setLabel('Contenu du hotfix')
            .setPlaceholder('Colle ici le hotfix...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(dateInput);
        const row2 = new ActionRowBuilder().addComponents(categoryInput);
        const row3 = new ActionRowBuilder().addComponents(contentInput);

        modal.addComponents(row1, row2, row3);

        await interaction.showModal(modal);

    },

    // =========================
    // 📝 Modal
    // =========================
    async modal(interaction) {

        if (interaction.customId !== 'hotfix_modal') return;

        const date = interaction.fields.getTextInputValue('date');
        const category = interaction.fields.getTextInputValue('category');
        const content = interaction.fields.getTextInputValue('content');

        // 📢 Salon cible
        const channel = interaction.guild.channels.cache.get('1507863529187967157');

        if (!channel) {

            return interaction.reply({
                content: '❌ Salon introuvable.',
                ephemeral: true
            });

        }

        // ✨ Embed propre
        const embed = new EmbedBuilder()

            .setColor('#111214')

            .setAuthor({
                name: `HOTFIX DU ${date}`
            })

            .setDescription(
`## ${category}

${content}`
            )

            .setFooter({
                text: 'IrisFA • Hotfix'
            })

            .setTimestamp();

        // 📤 Envoi
        await channel.send({
            embeds: [embed]
        });

        // ✅ Confirmation
        await interaction.reply({
            content: '✅ Hotfix envoyé avec succès.',
            ephemeral: true
        });

    }

};