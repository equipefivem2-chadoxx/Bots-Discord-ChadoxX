const { Events, EmbedBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket') return;

        const staffRoleId = '1516530361511710730';
        const logChannelId = '1516530714592546886'; // Ton salon de logs

        // 1. Vérification des permissions
        if (!interaction.member.roles.cache.has(staffRoleId)) {
            return interaction.reply({ 
                content: "❌ Seul un membre du staff peut fermer ce ticket.", 
                ephemeral: true 
            });
        }

        // On avertit que ça charge, car la création du HTML peut prendre 1 ou 2 secondes
        await interaction.reply({ content: "⏳ Génération de la sauvegarde et fermeture du ticket en cours..." });

        try {
            // 2. Génération du Transcript (Fichier HTML)
            const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                limit: -1, // Sauvegarde absolument tous les messages
                returnType: 'attachment', 
                filename: `${interaction.channel.name}.html`,
                saveImages: true, // Intègre les images directement dans le fichier
                poweredBy: false, // Retire les crédits du module pour faire plus pro
                footerText: "Exporté le {date}"
            });

            // 3. Création de l'Embed de Logs complet
            const goldColor = '#d4af37';
            const logEmbed = new EmbedBuilder()
                .setColor(goldColor)
                .setAuthor({ name: "Logs de Tickets | Iris'Studio", iconURL: interaction.guild.iconURL() })
                .setTitle('🎫 Bilan de Fermeture')
                .addFields(
                    { name: '📝 Nom du Ticket', value: `\`${interaction.channel.name}\``, inline: true },
                    { name: '🔒 Fermé par', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '📂 Sauvegarde', value: 'Le transcript complet de la conversation se trouve en pièce jointe ci-dessous.', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: "Système de Logs Premium" });

            // 4. Envoi des logs et du fichier dans le salon cible
            const logChannel = interaction.client.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            } else {
                console.error("Erreur : Salon de logs introuvable. Vérifie l'ID.");
            }

            // 5. Suppression du salon après 3 secondes
            setTimeout(() => {
                interaction.channel.delete().catch(console.error);
            }, 3000);

        } catch (error) {
            console.error(error);
            // Si une erreur survient (ex: manque de permissions), on prévient
            await interaction.editReply({ content: "❌ Une erreur est survenue lors de la sauvegarde. Le ticket n'a pas pu être fermé." });
        }
    }
};