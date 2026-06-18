const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Exclut temporairement un membre (il ne pourra plus rien faire).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('Le membre à exclure')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('duree')
                .setDescription('Durée de l\'exclusion')
                .setRequired(true)
                .addChoices(
                    { name: '60 Secondes', value: 60 * 1000 },
                    { name: '1 Heure', value: 60 * 60 * 1000 },
                    { name: '1 Jour', value: 24 * 60 * 60 * 1000 },
                    { name: '1 Semaine', value: 7 * 24 * 60 * 60 * 1000 }
                )
        )
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison de l\'exclusion')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('membre');
        const duration = interaction.options.getInteger('duree');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';

        if (!targetUser) {
            return interaction.reply({ content: "❌ Membre introuvable.", ephemeral: true });
        }

        // On vérifie si le bot peut timeout la personne
        if (!targetUser.moderatable) {
            return interaction.reply({ content: "❌ Je n'ai pas les permissions pour exclure ce membre.", ephemeral: true });
        }

        try {
            // Le vrai timeout Discord (la valeur doit être en millisecondes)
            await targetUser.timeout(duration, reason);
            
            // On calcule la durée en texte clair pour l'affichage
            let durationText = "Inconnue";
            if (duration === 60000) durationText = "60 Secondes";
            if (duration === 3600000) durationText = "1 Heure";
            if (duration === 86400000) durationText = "1 Jour";
            if (duration === 604800000) durationText = "1 Semaine";

            const timeoutEmbed = new EmbedBuilder()
                .setColor('#ff9900') // Orange pour l'avertissement
                .setTitle('⏳ Membre Exclu (Timeout)')
                .addFields(
                    { name: 'Membre', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Durée', value: durationText, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [timeoutEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors de l'exclusion.", ephemeral: true });
        }
    }
};