const { PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'close',
    description: 'Archive automatiquement et ferme le dossier d\'opération.',
    async execute(message, args) {
        // Sécurité : Vérification de la catégorie
        const opsCategory = '1489685701443452949';
        if (message.channel.parentId !== opsCategory) {
            return message.reply("❌ Cette commande est réservée uniquement aux dossiers d'opération.");
        }

        // Sécurité : Vérification des droits
        if (!message.member.permissionsIn(message.channel).has(PermissionFlagsBits.ManageChannels)) {
            return message.reply("❌ Tu n'as pas la permission de fermer ce dossier.");
        }

        // Vérification du salon des archives
        const archiveChannelId = '1515666757732270110';
        const archiveChannel = message.client.channels.cache.get(archiveChannelId) || await message.client.channels.fetch(archiveChannelId).catch(() => null);

        if (!archiveChannel) {
            return message.reply("❌ Impossible de trouver le salon des archives. Fermeture annulée pour éviter la perte de données.");
        }

        await message.reply("⏳ **Fermeture en cours...** Génération de l'archive automatique avant suppression.");

        try {
            // 1. Récupération des messages
            let messages = [];
            let lastId;
            while (true) {
                const options = { limit: 100 };
                if (lastId) options.before = lastId;
                const fetched = await message.channel.messages.fetch(options);
                messages.push(...fetched.values());
                if (fetched.size !== 100) break;
                lastId = fetched.last().id;
            }
            messages.reverse();

            // 2. Formatage du texte pour l'archive
            let transcriptText = `=========================================\n`;
            transcriptText += `📁 ARCHIVE DU DOSSIER : ${message.channel.name}\n`;
            transcriptText += `📅 Date de fermeture : ${new Date().toLocaleString('fr-FR')}\n`;
            transcriptText += `👤 Fermé par (Commande) : ${message.author.tag}\n`;
            transcriptText += `=========================================\n\n`;

            messages.forEach(msg => {
                const date = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
                const content = msg.content || '[Image/Embed ou message système]';
                transcriptText += `[${date}] ${msg.author.tag} : ${content}\n`;
            });

            const attachment = new AttachmentBuilder(Buffer.from(transcriptText, 'utf-8'), { name: `archive-${message.channel.name}.txt` });

            // 3. L'Embed pour le salon des archives
            const embed = new EmbedBuilder()
                .setTitle('💾 Archive d\'Opération')
                .setColor('#E74C3C') // Rouge SASP
                .addFields(
                    { name: '📁 Dossier', value: message.channel.name, inline: true },
                    { name: '👤 Fermé par', value: `<@${message.author.id}>`, inline: true }
                )
                .setFooter({ text: 'SASP - Bureau des Opérations' })
                .setTimestamp();

            // 4. Envoi de l'archive et suppression du salon
            await archiveChannel.send({ embeds: [embed], files: [attachment] });
            await message.channel.delete();

        } catch (error) {
            console.error("Erreur lors de la fermeture/archivage :", error);
            await message.channel.send("❌ Une erreur est survenue lors de l'archivage. Le dossier n'a pas été supprimé.");
        }
    }
};