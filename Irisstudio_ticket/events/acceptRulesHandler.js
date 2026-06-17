const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // On vérifie que c'est bien notre bouton du règlement
        if (!interaction.isButton() || interaction.customId !== 'accept_rules') return;

        // L'ID du rôle membre à donner
        const memberRoleId = '1516530394491654334';
        const role = interaction.guild.roles.cache.get(memberRoleId);

        if (!role) {
            return interaction.reply({ content: "❌ Le rôle configuré est introuvable sur le serveur.", ephemeral: true });
        }

        // Vérification si le membre a déjà le rôle
        if (interaction.member.roles.cache.has(memberRoleId)) {
            return interaction.reply({ 
                content: "✅ Tu as déjà accepté le règlement et reçu ton rôle !", 
                ephemeral: true 
            });
        }

        try {
            // Ajout du rôle
            await interaction.member.roles.add(role);
            
            // Message de confirmation caché pour l'utilisateur
            await interaction.reply({ 
                content: "🎉 Merci d'avoir accepté le règlement ! Tu as maintenant accès au serveur.", 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ Une erreur est survenue. Vérifie que mon rôle de Bot est placé **au-dessus** du rôle que j'essaie de donner dans les paramètres du serveur.", 
                ephemeral: true 
            });
        }
    }
};