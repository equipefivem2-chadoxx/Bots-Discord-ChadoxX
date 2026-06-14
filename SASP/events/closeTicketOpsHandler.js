const { Events, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'close_ticket_ops') return;

        if (!interaction.member.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: "❌ Seul un administrateur ou le propriétaire du ticket peut le fermer.", ephemeral: true });
        }

        const archiveChannelId = '1515666757732270110';
        const archiveChannel = interaction.client.channels.cache.get(archiveChannelId) || await interaction.client.channels.fetch(archiveChannelId).catch(() => null);

        if (!archiveChannel) {
            return interaction.reply({ content: "❌ Impossible de trouver le salon des archives. Fermeture annulée.", ephemeral: true });
        }

        await interaction.reply({ content: "⏳ **Fermeture en cours...** Génération de l'archive automatique avant suppression.", ephemeral: false });

        try {
            // 1. Récupération des messages
            let messages = [];
            let lastId;
            while (true) {
                const options = { limit: 100 };
                if (lastId) options.before = lastId;
                const fetched = await interaction.channel.messages.fetch(options);
                messages.push(...fetched.values());
                if (fetched.size !== 100) break;
                lastId = fetched.last().id;
            }
            messages.reverse();

            // 2. Formatage du texte pour l'archive
            let transcriptText = `=========================================\n`;
            transcriptText += `📁 ARCHIVE DU DOSSIER : ${interaction.channel.name}\n`;
            transcriptText += `📅 Date de fermeture : ${new Date().toLocaleString('fr-FR')}\n`;
            transcriptText += `👤 Fermé par (Bouton) : ${interaction.user.tag}\n`;
            transcriptText += `=========================================\n\n`;

            messages.forEach(msg => {
                const date = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
                const content = msg.content || '[Image/Embed ou message système]';
                transcriptText += `[${date}] ${msg.author.tag} : ${content}\n`;
            });

            const attachment = new AttachmentBuilder(Buffer.from(transcriptText, 'utf-8'), { name: `archive-${interaction.channel.name}.txt` });

            // 3. L'Embed pour le salon des archives
            const embed = new EmbedBuilder()
                .setTitle('💾 Archive d\'Opération')
                .setColor('#E74C3C') // Rouge SASP
                .addFields(
                    { name: '📁 Dossier', value: interaction.channel.name, inline: true },
                    { name: '👤 Fermé par', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setFooter({ text: 'SASP - Bureau des Opérations' })
                .setTimestamp();

            // 4. Envoi de l'archive et suppression du salon
            await archiveChannel.send({ embeds: [embed], files: [attachment] });
            await interaction.channel.delete();

        } catch (error) {
            console.error("Erreur lors de la fermeture/archivage par bouton :", error);
            await interaction.channel.send("❌ Une erreur est survenue lors de l'archivage. Le dossier n'a pas été supprimé.");
        }
    }
};