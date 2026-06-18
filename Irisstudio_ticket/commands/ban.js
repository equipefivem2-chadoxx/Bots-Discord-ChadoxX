const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit définitivement un membre du serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('Le membre à bannir')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option.setName('supprimer_messages')
                .setDescription('Veux-tu supprimer ses messages récents ?')
                .setRequired(false)
                .addChoices(
                    { name: 'Ne rien supprimer', value: 0 },
                    { name: 'Dernières 24 heures', value: 86400 }, // Valeur en secondes pour l'API Discord
                    { name: 'Derniers 7 jours', value: 604800 }
                )
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const deleteSeconds = interaction.options.getInteger('supprimer_messages') || 0;

        if (!targetUser) {
            return interaction.reply({ content: "❌ Membre introuvable.", ephemeral: true });
        }

        if (!targetUser.bannable) {
            return interaction.reply({ content: "❌ Je n'ai pas les permissions pour bannir ce membre (son rôle est supérieur au mien ou il est propriétaire).", ephemeral: true });
        }

        try {
            // Le vrai ban Discord
            await targetUser.ban({ reason: reason, deleteMessageSeconds: deleteSeconds });
            
            const banEmbed = new EmbedBuilder()
                .setColor('#ff0000') // Rouge sang
                .setTitle('🔨 Coup de Marteau : Membre Banni')
                .setThumbnail(targetUser.user.displayAvatarURL())
                .addFields(
                    { name: 'Membre', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [banEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors du bannissement.", ephemeral: true });
        }
    }
};