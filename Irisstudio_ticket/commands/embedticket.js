const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedticket')
        .setDescription('Envoie le panel de création de tickets avec le menu déroulant.'),
    async execute(interaction) {
        // IDs que tu m'as fournis
        const allowedRoleId = '1516530356314968115';
        const targetChannelId = '1516531376436940910';

        // 1. Vérification du rôle
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        // 2. Récupération du salon cible
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);
        if (!targetChannel) {
            return interaction.reply({ 
                content: "❌ Le salon cible est introuvable. Vérifie l'ID.", 
                ephemeral: true 
            });
        }

        // 3. Création de l'Embed (Design super clean)
        const embed = new EmbedBuilder()
            .setTitle('🎫 Centre d\'Assistance - Iris\'Studio')
            .setDescription('Besoin d\'aide ? Veuillez sélectionner la catégorie qui correspond à votre besoin dans le menu ci-dessous pour ouvrir un ticket.')
            .setColor('#2b2d31') // Une couleur sombre très clean et moderne
            .setFooter({ text: 'Iris\'Studio', iconURL: interaction.guild.iconURL() });

        // 4. Création du menu déroulant (Select Menu)
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Sélectionnez une catégorie de ticket...')
            .addOptions([
                { label: 'Ticket Support', description: 'Besoin d\'assistance technique', value: 'support', emoji: '🛠️' },
                { label: 'Ticket Achat', description: 'Question ou problème lié à un achat', value: 'achat', emoji: '🛒' },
                { label: 'Ticket Collaboration', description: 'Proposition de partenariat ou collaboration', value: 'colab', emoji: '🤝' },
                { label: 'Ticket Questions', description: 'Une question générale sur nos services', value: 'questions', emoji: '❓' },
                { label: 'Ticket Autres', description: 'Pour toute autre demande', value: 'autre', emoji: '📝' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 5. Envoi du panel et confirmation
        await targetChannel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: "✅ Le panel de tickets a été envoyé avec succès !", ephemeral: true });
    }
};