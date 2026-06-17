const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // On ignore si ce n'est pas notre menu de tickets
        if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_select') return;

        // Dictionnaire de tes catégories
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

        // On fait patienter l'interaction le temps de créer le salon
        await interaction.deferReply({ ephemeral: true });

        try {
            // Création du salon dans la bonne catégorie
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: selectedCategory,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // Cache le salon à tout le monde
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id, // Affiche le salon au créateur
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                    // Note: Plus tard, tu pourras ajouter un bloc ici pour donner l'accès au rôle "Staff"
                ]
            });

            // Message de bienvenue dans le nouveau ticket
            const welcomeEmbed = new EmbedBuilder()
                .setTitle('🎟️ Nouveau Ticket')
                .setDescription(`Bienvenue <@${interaction.user.id}> !\n\nMerci de détailler ta demande ici, un membre de l'équipe va te prendre en charge sous peu.`)
                .setColor('#2b2d31');

            await channel.send({ content: `<@${interaction.user.id}>`, embeds: [welcomeEmbed] });

            // On confirme à l'utilisateur que c'est bon
            await interaction.editReply({ content: `✅ Ton ticket a été créé avec succès : <#${channel.id}>` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "❌ Une erreur s'est produite lors de la création du ticket." });
        }
    }
};