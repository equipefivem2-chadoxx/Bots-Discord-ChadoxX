const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ajouter')
        .setDescription('Ajoute un membre ou un rôle au dossier d\'opération actuel.')
        .addMentionableOption(option => 
            option.setName('cible')
                .setDescription('Le membre ou le rôle à ajouter (ex: @JohnDoe ou @LSPD)')
                .setRequired(true)
        ),
        
    async execute(interaction, client) {
        // 1. Sécurité : Vérifier que la commande est bien tapée dans un dossier (catégorie ticket)
        if (interaction.channel.parentId !== config.ticketCategoryId) {
            return interaction.reply({ 
                content: "❌ Cette commande ne peut être utilisée que dans un dossier d'opération.", 
                ephemeral: true 
            });
        }

        // 2. Récupération de la cible (Joueur ou Rôle)
        const cible = interaction.options.getMentionable('cible');

        try {
            // 3. Modification des permissions du salon pour la cible
            await interaction.channel.permissionOverwrites.create(cible.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
            });

            // 4. Message de confirmation public dans le dossier
            await interaction.reply({ 
                content: `✅ Accès accordé : ${cible} a été ajouté(e) au dossier d'opération par ${interaction.user}.` 
            });

        } catch (error) {
            console.error("❌ Erreur lors de l'ajout au ticket :", error);
            await interaction.reply({ 
                content: "⚠️ Une erreur est survenue. Vérifiez que j'ai bien les permissions de gérer ce salon.", 
                ephemeral: true 
            });
        }
    }
};