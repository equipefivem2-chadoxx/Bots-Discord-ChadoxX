const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        
        // Si le bouton cliqué n'est PAS celui du règlement, on s'arrête là et on laisse l'autre fichier s'en occuper
        if (interaction.customId !== 'accept_rules') return;

        // Le rôle que tu veux donner (Ping Live / Membre)
        const roleId = '1502295171759472700';
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.reply({ content: '❌ Le rôle à attribuer est introuvable. Contactez le staff.', ephemeral: true });
        }

        try {
            // Si le membre a déjà le rôle
            if (interaction.member.roles.cache.has(roleId)) {
                return interaction.reply({ content: 'Tu as déjà accepté le règlement ! Amuse-toi bien 🎀', ephemeral: true });
            }

            // On donne le rôle
            await interaction.member.roles.add(role);
            await interaction.reply({ content: '✅ Règlement accepté ! Tu as maintenant accès au serveur. 💖', ephemeral: true });
            
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "❌ Une erreur est survenue. Vérifiez que mon rôle de bot est bien **au-dessus** du rôle que je dois donner dans les paramètres du serveur !", ephemeral: true });
        }
    },
};