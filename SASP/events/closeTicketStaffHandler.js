const { Events, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const audit = require('./auditLogs');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket_staff') return;

        await interaction.reply("⏳ Archivage et fermeture en cours...");

        try {
            // 1. Récupérer l'historique des messages
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = messages.map(m => `[${m.createdAt.toLocaleString('fr-FR')}] ${m.author.tag}: ${m.content}`).reverse().join('\n');
            const attachment = new AttachmentBuilder(Buffer.from(transcript), { name: 'ticket.txt' });

            // 2. Envoyer dans le salon d'archives
            const archiveChannel = interaction.client.channels.cache.get('1515666786660647054');
            const archiveMsg = await archiveChannel.send({ 
                content: `📁 Archive du ticket **${interaction.channel.name}**`, 
                files: [attachment] 
            });

            // 3. LOG (Embed)
            audit.sendAuditLog(interaction.client, 'CLOSE', {
                user: `<@${interaction.user.id}>`,
                channelName: interaction.channel.name,
                action: 'Fermeture de ticket Staff'
            });

            // 4. SAUVEGARDE DB avec le lien
            audit.saveTicket(
                interaction.user.id, 
                interaction.user.username, 
                interaction.channel.name, 
                'FERMETURE', 
                archiveMsg.url
            );

            // 5. Suppression
            setTimeout(() => interaction.channel.delete().catch(console.error), 3000);
        } catch (err) {
            console.error(err);
            interaction.followUp("❌ Erreur lors de l'archivage.");
        }
    }
};