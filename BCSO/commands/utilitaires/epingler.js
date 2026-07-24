const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('epingler')
        .setDescription('Épingle un post de forum tout en haut du salon.')
        .addStringOption(option => 
            option.setName('lien')
                .setDescription('Le lien complet du post de forum à épingler')
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

        // Regex pour récupérer l'ID du post (qui est considéré comme un channel par Discord)
        const discordLinkRegex = /channels\/\d+\/(\d+)/;
        const match = url.match(discordLinkRegex);

        if (!match) {
            return interaction.reply({ 
                content: `❌ Le lien fourni n'est pas reconnu. Assure-toi d'avoir bien fait clic droit -> "Copier le lien" sur le post.`, 
                ephemeral: true 
            });
        }

        const targetId = match[1];

        await interaction.deferReply({ ephemeral: true });

        try {
            // Récupération de l'entité Discord (le post de forum / thread)
            const target = await interaction.client.channels.fetch(targetId);
            
            if (!target) {
                return interaction.editReply({ 
                    content: "❌ Impossible de trouver le post lié à ce lien." 
                });
            }

            // On s'assure que c'est bien un post de forum (Thread)
            if (target.isThread()) {
                // Modification des paramètres du post : Le chiffre 2 (bit 1 << 1) correspond au statut "Pinned" (Épinglé) dans l'API Discord
                await target.edit({ flags: target.flags.bitfield | 2 });
                
                await interaction.editReply({ 
                    content: "📌 Le post a bien été épinglé tout en haut du forum !" 
                });
            } else {
                return interaction.editReply({ 
                    content: "⚠️ Le lien ne pointe pas vers un post de forum valide. Assure-toi de copier le lien global du post." 
                });
            }

            // Autodestruction de la réponse
            setTimeout(async () => {
                await interaction.deleteReply().catch(() => {});
            }, 1500);

        } catch (error) {
            console.error("❌ Erreur lors de l'exécution de epingler :", error);
            await interaction.editReply({ 
                content: "⚠️ Impossible d'exécuter l'épinglage. Vérifie que j'ai bien la permission 'Gérer les fils de discussion/salons'." 
            });
        }
    }
};