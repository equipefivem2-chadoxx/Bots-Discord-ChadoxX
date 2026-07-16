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

        // On récupère le lien et on nettoie les espaces invisibles avant et après
        const url = interaction.options.getString('lien').trim();

        // Regex blindée : on se fiche du domaine (discord.com, ptb.discord, etc.), on cherche juste la structure ID
        const discordLinkRegex = /channels\/\d+\/(\d+)(?:\/(\d+))?/;
        const match = url.match(discordLinkRegex);

        if (!match) {
            return interaction.reply({ 
                content: `❌ Le lien fourni n'est pas reconnu. Assure-toi d'avoir bien fait "Copier le lien".`, 
                ephemeral: true 
            });
        }

        const [, targetId, messageId] = match;

        await interaction.deferReply({ ephemeral: true });

        try {
            // Récupération de l'entité Discord (Salon, Thread ou Post)
            const target = await interaction.client.channels.fetch(targetId);
            
            if (!target) {
                return interaction.editReply({ 
                    content: "❌ Impossible de trouver le salon ou le post lié à ce lien." 
                });
            }

            // CAS 1 : C'est un Thread (Post de Forum ou fil de discussion)
            if (target.isThread()) {
                await target.delete();
                await interaction.editReply({ 
                    content: "🗑️ Le post de forum a été entièrement supprimé ! Nettoyage..." 
                });
            } 
            
            // CAS 2 : C'est un salon textuel classique
            else if (target.isTextBased()) {
                if (messageId) {
                    const message = await target.messages.fetch(messageId);
                    await message.delete();
                    await interaction.editReply({ 
                        content: "🗑️ Le message a été supprimé avec succès ! Nettoyage..." 
                    });
                } else {
                    return interaction.editReply({ 
                        content: "⚠️ Par sécurité, je ne peux pas supprimer un salon textuel complet." 
                    });
                }
            } else {
                return interaction.editReply({ 
                    content: "❌ Ce type de salon n'est pas pris en charge." 
                });
            }

            // Autodestruction de la réponse
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