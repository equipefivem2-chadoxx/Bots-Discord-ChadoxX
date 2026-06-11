const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'accept_rules') return;

        const memberRoleId = '1503490225995907204';

        try {
            // Vérifie si l'utilisateur a déjà le rôle
            if (interaction.member.roles.cache.has(memberRoleId)) {
                return interaction.reply({ 
                    content: '💡 Vous avez déjà validé le règlement et possédez déjà le rôle.', 
                    ephemeral: true 
                });
            }

            // Ajout du rôle
            await interaction.member.roles.add(memberRoleId);
            
            await interaction.reply({ 
                content: '✅ **Règlement accepté !** Vous avez maintenant accès au reste du serveur.', 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Erreur lors de l'attribution du rôle règlement :", error);
            await interaction.reply({ 
                content: '❌ Une erreur est survenue lors de l\'attribution du rôle. Contactez un administrateur.', 
                ephemeral: true 
            });
        }
    },
};