const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedticket')
        .setDescription('Envoie le panel de création de tickets.'),
    async execute(interaction) {
        // IDs
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

        // --- SECTION DESIGN ÉPURÉ ---
        const goldColor = '#d4af37'; // Couleur or assortie à ton logo

        // 3. Création de l'Embed unique
        const embed = new EmbedBuilder()
            .setColor(goldColor)
            .setAuthor({ name: "Iris'Studio | Centre d'Assistance", iconURL: interaction.guild.iconURL() })
            .setDescription("Bienvenue sur notre support.\n\nAfin de vous rediriger vers le bon service, veuillez sélectionner la catégorie qui correspond à votre besoin dans le menu déroulant ci-dessous.\n\n> ⏳ *Notre équipe prendra en charge votre ticket dans les plus brefs délais.*")
            .setFooter({ text: "Iris'Studio", iconURL: interaction.guild.iconURL() });

        // 4. Menu déroulant simplifié
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Sélectionnez une catégorie...')
            .addOptions([
                { label: 'Support Technique', value: 'support', emoji: '🛠️' },
                { label: 'Achat / Boutique', value: 'achat', emoji: '🛒' },
                { label: 'Partenariat / Collaboration', value: 'colab', emoji: '🤝' },
                { label: 'Question Générale', value: 'questions', emoji: '❓' },
                { label: 'Autre Demande', value: 'autre', emoji: '📝' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 5. Envoi
        await targetChannel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: "✅ Panel épuré envoyé avec succès !", ephemeral: true });
    }
};