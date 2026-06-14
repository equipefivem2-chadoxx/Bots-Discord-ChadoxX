const { Events, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'close_ticket_ops_nord') return;

        if (!interaction.member.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: "❌ Seul un administrateur ou le propriétaire du ticket peut le fermer.", ephemeral: true });
        }

        const archiveChannelId = '1515666786660647054'; // Archive NORD
        const archiveChannel = interaction.client.channels.cache.get(archiveChannelId) || await interaction.client.channels.fetch(archiveChannelId).catch(() => null);

        if (!archiveChannel) {
            return interaction.reply({ content: "❌ Impossible de trouver le salon des archives NORD. Fermeture annulée.", ephemeral: true });
        }

        await interaction.reply({ content: "⏳ **Fermeture en cours...** Génération de l'archive automatique avant suppression.", ephemeral: false });

        try {
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

            let transcriptText = `=========================================\n`;
            transcriptText += `📁 ARCHIVE DU DOSSIER (NORD) : ${interaction.channel.name}\n`;
            transcriptText += `📅 Date de fermeture : ${new Date().toLocaleString('fr-FR')}\n`;
            transcriptText += `👤 Fermé par (Bouton) : ${interaction.user.tag}\n`;
            transcriptText += `=========================================\n\n`;

            messages.forEach(msg => {
                const date = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
                const content = msg.content || '[Image/Embed ou message système]';
                transcriptText += `[${date}] ${msg.author.tag} : ${content}\n`;
            });

            const attachment = new AttachmentBuilder(Buffer.from(transcriptText, 'utf-8'), { name: `archive-nord-${interaction.channel.name}.txt` });

            const embed = new EmbedBuilder()
                .setTitle('💾 Archive d\'Opération NORD')
                .setColor('#E74C3C')
                .addFields(
                    { name: '📁 Dossier', value: interaction.channel.name, inline: true },
                    { name: '👤 Fermé par', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setFooter({ text: 'SASP - Bureau des Opérations Nord' })
                .setTimestamp();

            await archiveChannel.send({ embeds: [embed], files: [attachment] });
            await interaction.channel.delete();

        } catch (error) {
            console.error(error);
            await interaction.channel.send("❌ Une erreur est survenue lors de l'archivage.");
        }
    }
};