const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedreglement')
        .setDescription('Envoie l\'embed du règlement officiel avec le bouton d\'acceptation.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
    async execute(interaction) {
        const targetChannelId = '1516530506773303387';
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.reply({ content: "❌ Le salon cible est introuvable. Vérifie l'ID.", ephemeral: true });
        }

        const goldColor = '#d4af37'; 
        
        const reglementEmbed = new EmbedBuilder()
            .setColor(goldColor)
            .setAuthor({ name: "Iris'Studio | Charte Communautaire", iconURL: interaction.guild.iconURL() })
            .setTitle('📜 RÈGLEMENT DE LA COMMUNAUTÉ')
            .setDescription("Bienvenue sur notre serveur Discord. Afin de garantir une expérience agréable pour tous les membres, merci de prendre connaissance et de respecter les règles ci-dessous.\n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬")
            .addFields(
                { name: '🤝 Respect et bienveillance', value: "Le respect entre les membres est une priorité.\n> • Toute forme d'insulte, de provocation ou de manque de respect est interdite.\n> • Les propos discriminatoires, racistes, sexistes, homophobes, transphobes ou haineux ne seront jamais tolérés.\n> • Le harcèlement, l'intimidation ou les attaques répétées envers un membre sont strictement interdits.\n> • Les débats sont autorisés tant qu'ils restent courtois et respectueux." },
                { name: '🗣️ Utilisation des salons', value: "Chaque salon possède une utilité précise.\n> • Utilisez les salons correspondant au sujet de votre message.\n> • Le spam, le flood et les messages répétitifs sont interdits.\n> • Évitez l'utilisation abusive des MAJUSCULES, souvent assimilée à des cris.\n> • Les hors-sujets excessifs pourront être supprimés afin de conserver un serveur organisé.\n> • Merci de ne pas monopoliser les conversations au détriment des autres membres." },
                { name: '🔞 Contenus interdits', value: "Pour la sécurité et le confort de tous :\n> • Les contenus pornographiques, NSFW, choquants ou gore sont strictement interdits.\n> • Le partage de virus, logiciels malveillants, cracks, cheats ou tout contenu illégal est prohibé.\n> • Les liens de phishing, tentatives d'arnaque ou de vol de données entraîneront une sanction immédiate.\n> • Tout contenu contraire aux Conditions d'Utilisation de Discord est interdit." },
                { name: '🎤 Utilisation des salons vocaux', value: "Les salons vocaux doivent rester agréables pour tous les participants.\n> • Les cris, bruits parasites, micros volontairement saturés ou nuisances sonores sont interdits.\n> • La diffusion de musique n'est autorisée qu'avec l'accord des personnes présentes.\n> • L'utilisation des soundboards doit rester raisonnable et ne pas perturber les discussions.\n> • Toute usurpation d'identité via le pseudo, l'avatar ou le statut Discord est interdite." },
                { name: '📢 Publicité et promotion', value: "La publicité est réglementée.\n> • Toute publicité est interdite sans autorisation préalable du staff.\n> • L'auto-promotion en messages privés auprès des membres du serveur est strictement interdite.\n> • Les invitations vers d'autres serveurs Discord, réseaux sociaux ou projets personnels doivent être approuvous par l'équipe de modération." },
                { name: '🛡️ Modération et sanctions', value: "L'équipe de modération veille au bon fonctionnement du serveur.\n> • Les membres du staff sont chargés de faire respecter ce règlement.\n> • Toute décision de modération doit être respectée.\n> • Les sanctions peuvent prendre différentes formes : avertissement, mute, kick ou bannissement (selon la gravité).\n> • En cas de désaccord ou de litige, contactez calmement un membre du staff en message privé." },
                { name: '⚠️ Règlement général', value: "> • Le règlement s'applique à l'ensemble du serveur (vocaux, messages privés liés au serveur, événements).\n> • Toute tentative de contournement d'une sanction entraînera des sanctions supplémentaires.\n> • Le staff se réserve le droit d'adapter ou de modifier le règlement à tout moment." },
                { name: '✅ Validation', value: "En cliquant sur le bouton ci-dessous, **vous confirmez avoir pris connaissance de l'ensemble des règles et vous engagez à les respecter**.\n\n*Nous vous souhaitons une excellente expérience au sein de la communauté.*" }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: "Direction Iris'Studio", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // --- NOUVEAU : LE BOUTON ACCEPTER ---
        const acceptButton = new ButtonBuilder()
            .setCustomId('accept_rules')
            .setLabel('Accepter le règlement')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success); // Bouton vert

        const row = new ActionRowBuilder().addComponents(acceptButton);

        try {
            // On envoie l'embed ET le composant (bouton)
            await targetChannel.send({ embeds: [reglementEmbed], components: [row] });
            await interaction.reply({ content: `✅ Le règlement et le bouton ont été publiés avec succès dans <#${targetChannelId}> !`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors de l'envoi.", ephemeral: true });
        }
    }
};