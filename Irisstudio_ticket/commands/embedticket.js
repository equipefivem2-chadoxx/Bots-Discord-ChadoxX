const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedticket')
        .setDescription('Envoie le panel de création de tickets avec le menu déroulant stylisé.'),
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

        // --- SECTION STYLE PREMIUM ---
        // Une couleur profonde (Teal sombre) qui rend super bien avec le gold
        const premiumColor = '#1d606b'; 
        const guildIcon = interaction.guild.iconURL();

        // 3. Création des Embeds Empilés (Stack)

        // Embed d'En-tête : Focus sur la marque
        const headerEmbed = new EmbedBuilder()
            .setTitle('🌐 CENTRE D\'ASSISTANCE Iris\'Studio')
            .setColor(premiumColor)
            .setThumbnail(guildIcon)
            .setDescription('Votre Hub de Support Premium, à votre écoute.')
            .addFields({ name: '\u200B', value: '✨ Bienvenue sur notre panel de ticket. Ce système est conçu pour vous offrir un service rapide, clair et de haute qualité.' });

        // Embed de Contenu : Les instructions claires
        const contentEmbed = new EmbedBuilder()
            .setColor(premiumColor)
            .setAuthor({ name: 'Iris\'Studio', iconURL: guildIcon })
            .setDescription('**Comment ouvrir un ticket ?**\nSuivez ces étapes simples pour obtenir de l\'aide :\n\n`1️⃣` Sélectionnez la catégorie ci-dessous.\n`2️⃣` Décrivez votre demande détaillée dans le salon créé.\n`3️⃣` Un membre de l\'équipe vous répondra sous peu.')
            .addFields(
                { name: '\u200B', value: '\u200B', inline: false },
                { name: '✅ NOS ENGAGEMENTS', value: 'Confidentialité Garantie\nRéponse Prioritaire\nExpertise Professionnelle', inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Spacer
                { name: '📝 CATEGORIES', value: '🛠️ Support\n🛒 Achat\n🤝 Collaboration\n❓ Question\n📝 Autre', inline: true }
            );

        // Embed de Pied de page : Touche finale clean
        const footerEmbed = new EmbedBuilder()
            .setColor(premiumColor)
            .setFooter({ text: '© Iris\'Studio - Droits Réservés', iconURL: guildIcon });


        // 4. Création du menu déroulant (Select Menu) stylisé
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Veuillez sélectionner une catégorie de ticket...')
            .addOptions([
                { label: 'SUPPORT', description: 'Assistance technique & Problèmes', value: 'support', emoji: '🛠️' },
                { label: 'ACHAT', description: 'Questions ou Problèmes d\'achat', value: 'achat', emoji: '🛒' },
                { label: 'COLLABORATION', description: 'Partenariat & Collaboration', value: 'colab', emoji: '🤝' },
                { label: 'QUESTIONS', description: 'Demandes générales', value: 'questions', emoji: '❓' },
                { label: 'AUTRES', description: 'Toute autre demande', value: 'autre', emoji: '📝' }
            ]);

        // Action Row pour le dropdown, labellisée pour le style
        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 5. Envoi du panel et confirmation
        // On envoie un tableau d'embeds [headerEmbed, contentEmbed, footerEmbed]
        await targetChannel.send({ embeds: [headerEmbed, contentEmbed, footerEmbed], components: [row] });
        await interaction.reply({ content: "✅ Le panel de tickets PREMIUM a été envoyé avec succès !", ephemeral: true });
    }
};