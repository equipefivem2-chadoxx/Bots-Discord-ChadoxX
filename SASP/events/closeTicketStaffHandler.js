const { Events, AttachmentBuilder } = require('discord.js');
const audit = require('./auditLogs');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket_staff') return;

        await interaction.reply("⏳ Archivage et fermeture en cours...");

        try {
            // 1. Récupération des messages
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = messages.map(m => `[${m.createdAt.toLocaleString('fr-FR')}] ${m.author.tag}: ${m.content}`).reverse().join('\n');
            const attachment = new AttachmentBuilder(Buffer.from(transcript), { name: `archive-${interaction.channel.name}.txt` });

            // 2. Envoi dans le salon UNIQUE de logs (1515690751177261277)
            const logChannelId = '1515690751177261277';
            const logChannel = interaction.client.channels.cache.get(logChannelId);
            
            const archiveMsg = await logChannel.send({ 
                content: `📁 **Fichier d'archive brute :** \`${interaction.channel.name}\``, 
                files: [attachment] 
            });

            // 🔥 ICI ON RÉCUPÈRE LE LIEN INTERNET DU FICHIER TXT
            const fileWebLink = archiveMsg.attachments.first().url;

            // 3. LOG Audit visuel dans le même salon
            audit.sendAuditLog(interaction.client, 'CLOSE', {
                user: `<@${interaction.user.id}>`,
                channelName: interaction.channel.name,
                action: 'Fermeture de ticket Staff'
            });

            // 4. SAUVEGARDE DB avec le vrai lien internet
            audit.saveTicket(
                interaction.user.id, 
                interaction.user.username, 
                interaction.channel.name, 
                'FERMETURE', 
                fileWebLink // <-- C'est ce lien web qui sera utilisé par !logs
            );

            // 5. Suppression
            setTimeout(() => interaction.channel.delete().catch(console.error), 3000);
        } catch (err) {
            console.error(err);
            interaction.followUp("❌ Erreur lors de l'archivage.");
        }
    }
};