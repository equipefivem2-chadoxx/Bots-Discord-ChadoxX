const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('epingler')
        .setDescription('Épingle un post de forum ou un message à partir de son lien.')
        .addStringOption(option => 
            option.setName('lien')
                .setDescription('Le lien complet du post (forum) ou du message à épingler')
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

        // On récupère le lien et on nettoie
        const url = interaction.options.getString('lien').trim();

        // Regex pour isoler l'ID du salon/thread et du message
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
                if (messageId) {
                    // Si un message précis dans le thread est ciblé
                    const message = await target.messages.fetch(messageId);
                    await message.pin();
                } else {
                    // C'est le post de forum en entier : on épingle son message d'origine
                    const starterMessage = await target.fetchStarterMessage();
                    if (starterMessage) {
                        await starterMessage.pin();
                    }
                }
                
                await interaction.editReply({ 
                    content: "📌 Le post a été épinglé avec succès !" 
                });
            } 
            
            // CAS 2 : C'est un salon textuel classique
            else if (target.isTextBased()) {
                if (messageId) {
                    const message = await target.messages.fetch(messageId);
                    await message.pin();
                    await interaction.editReply({ 
                        content: "📌 Le message a été épinglé avec succès !" 
                    });
                } else {
                    return interaction.editReply({ 
                        content: "⚠️ Le lien pointe vers un salon entier. Copie le lien d'un message spécifique." 
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
            console.error("❌ Erreur lors de l'exécution de epingler :", error);
            await interaction.editReply({ 
                content: "⚠️ Impossible d'exécuter l'épinglage. Vérifie que le message existe et que j'ai la permission 'Gérer les messages'." 
            });
        }
    }
};