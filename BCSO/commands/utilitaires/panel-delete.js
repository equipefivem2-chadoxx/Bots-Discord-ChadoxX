const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-delete')
        .setDescription('Supprime le panel d\'opération du salon ciblé.'),
        
    async execute(interaction, client) {
        // 🔒 Vérification des permissions (les mêmes que pour la création)
        const hasRole = interaction.member.roles.cache.some(role => config.allowedRolesCommand.includes(role.id));
        
        if (!hasRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas les permissions nécessaires pour utiliser cette commande.", 
                ephemeral: true 
            });
        }

        // On cible toujours le même salon
        const targetChannelId = '1427848018698440764';
        const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.reply({ 
                content: `❌ Impossible de trouver le salon cible (ID: ${targetChannelId}).`, 
                ephemeral: true 
            });
        }

        // On fait patienter l'utilisateur pendant que le bot cherche (pratique si ça prend 1-2 secondes)
        await interaction.deferReply({ ephemeral: true });

        try {
            // Le bot va lire les 50 derniers messages du salon
            const messages = await targetChannel.messages.fetch({ limit: 50 });
            
            // Il filtre pour trouver UNIQUEMENT ses propres messages qui contiennent des boutons (composants)
            const botPanels = messages.filter(msg => msg.author.id === client.user.id && msg.components.length > 0);

            if (botPanels.size === 0) {
                return interaction.editReply({ content: "⚠️ Aucun panel trouvé dans les récents messages de ce salon." });
            }

            // On supprime tous les panels trouvés
            let count = 0;
            for (const msg of botPanels.values()) {
                await msg.delete();
                count++;
            }

            return interaction.editReply({ 
                content: `✅ Nettoyage terminé : **${count}** panel(s) supprimé(s) dans le salon ${targetChannel}.` 
            });

        } catch (error) {
            console.error(error);
            return interaction.editReply({ 
                content: "❌ Une erreur est survenue lors de la suppression des panels. Le bot a-t-il bien la permission de 'Gérer les messages' ?" 
            });
        }
    }
};