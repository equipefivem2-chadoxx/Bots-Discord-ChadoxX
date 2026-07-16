const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delpost')
        .setDescription('Supprime un message à partir de son lien (Réservé au créateur du bot).')
        .addStringOption(option => 
            option.setName('lien')
                .setDescription('Le lien complet du message à supprimer')
                .setRequired(true)
        ),
        
    async execute(interaction, client) {
        // 1. Sécurité : Vérifier que l'utilisateur est bien le propriétaire configuré
        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        const url = interaction.options.getString('lien');

        // Expression régulière pour capturer le salon et l'ID du message depuis un lien Discord
        const discordLinkRegex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)/;
        const match = url.match(discordLinkRegex);

        if (!match) {
            return interaction.reply({ 
                content: "❌ Le lien fourni n'est pas un lien de message Discord valide.", 
                ephemeral: true 
            });
        }

        const [, channelId, messageId] = match;

        // On lance une réponse différée et éphémère (visible uniquement par toi)
        await interaction.deferReply({ ephemeral: true });

        try {
            // 2. Récupération du salon cible
            const channel = await interaction.client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.editReply({ 
                    content: "❌ Impossible d'accéder au salon ciblé (ou ce n'est pas un salon textuel)." 
                });
            }

            // 3. Récupération et suppression du message
            const message = await channel.messages.fetch(messageId);
            await message.delete();

            // 4. Confirmation invisible et autodestruction
            await interaction.editReply({ 
                content: "🗑️ Le message a été supprimé avec succès ! Nettoyage des traces..." 
            });

            // Supprime la notification éphémère après 1.5 seconde pour un clean absolu
            setTimeout(async () => {
                await interaction.deleteReply().catch(() => {});
            }, 1500);

        } catch (error) {
            console.error("❌ Erreur lors de l'exécution de delpost :", error);
            await interaction.editReply({ 
                content: "⚠️ Impossible de supprimer le message. Vérifie que le message existe toujours et que j'ai les permissions d'administration requises." 
                });
        }
    }
};