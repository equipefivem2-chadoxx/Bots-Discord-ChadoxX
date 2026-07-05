const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Renomme le dossier d\'opération actuel.')
        .addStringOption(option => 
            option.setName('nom')
                .setDescription('Le nouveau nom du dossier (ex: braquage-banque)')
                .setRequired(true)
        ),
        
    async execute(interaction, client) {
        // 1. Sécurité : Vérifier que la commande est bien tapée dans un dossier d'opération
        if (interaction.channel.parentId !== config.ticketCategoryId) {
            return interaction.reply({ 
                content: "❌ Cette commande ne peut être utilisée que dans un dossier d'opération.", 
                ephemeral: true 
            });
        }

        // 2. Récupération du nouveau nom
        // Discord transformera automatiquement les espaces en tirets et mettra tout en minuscules
        const nouveauNom = interaction.options.getString('nom');

        try {
            // 3. Renommage du salon
            await interaction.channel.setName(nouveauNom);

            // 4. Message de confirmation
            await interaction.reply({ 
                content: `📝 **Mise à jour du dossier :** Le salon a été renommé en \`${nouveauNom}\` par ${interaction.user}.` 
            });

        } catch (error) {
            console.error("❌ Erreur lors du renommage :", error);
            
            // ⚠️ Précision importante : Discord bloque techniquement les renommages trop fréquents
            await interaction.reply({ 
                content: "⚠️ **Erreur :** Impossible de renommer le salon. \n*Note : Discord limite le changement de nom à **2 fois toutes les 10 minutes** par salon pour éviter les abus.*", 
                ephemeral: true 
            });
        }
    }
};