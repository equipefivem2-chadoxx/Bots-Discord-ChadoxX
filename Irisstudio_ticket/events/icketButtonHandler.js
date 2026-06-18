const { Events, EmbedBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket') return;

        const staffRoleId = '1516530361511710730'; '1516530345250394273';
        const logChannelId = '1516530714592546886';

        if (!interaction.member.roles.cache.has(staffRoleId)) {
            return interaction.reply({ content: "❌ Seul un membre du staff peut fermer ce ticket.", ephemeral: true });
        }

        await interaction.reply({ content: "⏳ Génération de la sauvegarde et fermeture du ticket en cours..." });

        try {
            // L'ID du créateur est stocké dans le topic du salon
            const creatorId = interaction.channel.topic; 

            const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                limit: -1,
                returnType: 'attachment', 
                filename: `${interaction.channel.name}.html`,
                saveImages: true,
                poweredBy: false,
                footerText: "Exporté le {date}"
            });

            const goldColor = '#d4af37';
            const logEmbed = new EmbedBuilder()
                .setColor(goldColor)
                .setAuthor({ name: "Logs de Tickets | Iris'Studio", iconURL: interaction.guild.iconURL() })
                .setTitle('🎫 Bilan de Fermeture')
                .addFields(
                    { name: '📝 Nom du Ticket', value: `\`${interaction.channel.name}\``, inline: true },
                    { name: '👤 Créateur', value: creatorId ? `<@${creatorId}>` : 'Inconnu', inline: true },
                    { name: '🔒 Fermé par', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setTimestamp();

            const logChannel = interaction.client.channels.cache.get(logChannelId);
            let logMessage;
            if (logChannel) {
                logMessage = await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            }

            // --- 💾 SAUVEGARDE DANS L'HISTORIQUE ---
            if (creatorId && logMessage) {
                // On récupère le lien de téléchargement du fichier HTML généré par Discord
                const transcriptUrl = logMessage.attachments.first()?.url;
                const dbPath = path.join(__dirname, '..', 'data', 'tickets.json');
                
                // Création du fichier s'il n'existe pas
                if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
                
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                if (!db[creatorId]) db[creatorId] = []; // Crée un tableau pour ce joueur s'il n'en a pas
                
                // Ajout du ticket à son historique
                db[creatorId].push({
                    name: interaction.channel.name,
                    closedBy: interaction.user.id,
                    date: new Date().toLocaleDateString('fr-FR'),
                    url: transcriptUrl
                });
                
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
            }

            setTimeout(() => {
                interaction.channel.delete().catch(console.error);
            }, 3000);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "❌ Une erreur est survenue lors de la sauvegarde." });
        }
    }
};