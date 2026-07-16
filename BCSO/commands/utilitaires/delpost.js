const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delpost')
        .setDescription('Supprime un post de forum ou un message à partir de son lien (Réservé au créateur).')
        .addStringOption(option => 
            option.setName('lien')
                .setDescription('Le lien complet du post (forum) ou du message à supprimer')
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

        // Regex améliorée : capture l'ID du salon/post et rend l'ID du message optionnel
        const discordLinkRegex = /https:\/\/discord\.com\/channels\/\d+\/(\d+)(?:\/(\d+))?/;
        const match = url.match(discordLinkRegex);

        if (!match) {
            return interaction.reply({ 
                content: "❌ Le lien fourni n'est pas un lien Discord valide (salon, post ou message).", 
                ephemeral: true 
            });
        }

        const [, targetId, messageId] = match;

        // On lance une réponse différée et éphémère (visible uniquement par toi)
        await interaction.deferReply({ ephemeral: true });

        try {
            // Récupération de l'entité Discord (Salon, Thread ou Post)
            const target = await interaction.client.channels.fetch(targetId);
            
            if (!target) {
                return interaction.editReply({ 
                    content: "❌ Impossible de trouver le salon ou le post lié à ce lien." 
                });
            }

            // CAS 1 : C'est un Thread (donc un Post de Forum ou un fil de discussion)
            if (target.isThread()) {
                await target.delete();
                await interaction.editReply({ 
                    content: "🗑️ Le post de forum a été entièrement supprimé ! Nettoyage..." 
                });
            } 
            
            // CAS 2 : C'est un salon textuel classique
            else if (target.isTextBased()) {
                // Si on a un ID de message, on supprime uniquement le message
                if (messageId) {
                    const message = await target.messages.fetch(messageId);
                    await message.delete();
                    await interaction.editReply({ 
                        content: "🗑️ Le message a été supprimé avec succès ! Nettoyage..." 
                    });
                } else {
                    // Sécurité critique : Évite de supprimer un salon textuel entier par accident
                    return interaction.editReply({ 
                        content: "⚠️ Par sécurité, je ne peux pas supprimer un salon textuel complet. S'il s'agit d'un post de forum, copie bien le lien du post lui-même." 
                    });
                }
            } else {
                return interaction.editReply({ 
                    content: "❌ Ce type de salon n'est pas pris en charge." 
                });
            }

            // Supprime la notification éphémère après 1.5 seconde pour un clean absolu
            setTimeout(async () => {
                await interaction.deleteReply().catch(() => {});
            }, 1500);

        } catch (error) {
            console.error("❌ Erreur lors de l'exécution de delpost :", error);
            await interaction.editReply({ 
                content: "⚠️ Impossible d'exécuter la suppression. Vérifie que l'élément existe encore et que j'ai les permissions requises." 
            });
        }
    }
};