const { Events, AttachmentBuilder } = require('discord.js');
const audit = require('./auditLogs');
const fs = require('fs');
const path = require('path');

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

            // 2. Envoi dans le salon de logs (1515690751177261277)
            const logChannelId = '1515690751177261277';
            const logChannel = interaction.client.channels.cache.get(logChannelId);
            
            const archiveMsg = await logChannel.send({ 
                content: `📁 **Fichier d'archive brute :** \`${interaction.channel.name}\``, 
                files: [attachment] 
            });

            // On récupère le lien internet cliquable
            const fileWebLink = archiveMsg.attachments.first().url;

            // 🌟 NOUVEAU : RECHERCHE DU CRÉATEUR DU TICKET 🌟
            let originalUserId = interaction.user.id;
            let originalUserName = interaction.user.username;
            const dbPath = path.join(__dirname, '../ticketHistory.json');
            
            if (fs.existsSync(dbPath)) {
                try {
                    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                    // On cherche dans la DB qui a ouvert CE salon
                    const openLog = db.find(log => log.channelName === interaction.channel.name && log.action === 'OUVERTURE');
                    if (openLog) {
                        originalUserId = openLog.userId; // On récupère l'ID du joueur (ex: emmaaamvp)
                        originalUserName = openLog.userName;
                    }
                } catch (err) {}
            }

            // 3. LOG Audit visuel (On garde ton ID pour dire "C'est Jesse qui a fermé")
            audit.sendAuditLog(interaction.client, 'CLOSE', {
                user: `<@${interaction.user.id}>`,
                channelName: interaction.channel.name,
                action: 'Fermeture de ticket Staff'
            });

            // 4. SAUVEGARDE DB (On attribue l'archive au vrai joueur pour le !logs)
            audit.saveTicket(
                originalUserId, 
                originalUserName, 
                interaction.channel.name, 
                `FERMETURE (par ${interaction.user.username})`, 
                fileWebLink
            );

            // 5. Suppression du salon
            setTimeout(() => interaction.channel.delete().catch(console.error), 3000);
        } catch (err) {
            console.error(err);
            interaction.followUp("❌ Erreur lors de l'archivage.");
        }
    }
};