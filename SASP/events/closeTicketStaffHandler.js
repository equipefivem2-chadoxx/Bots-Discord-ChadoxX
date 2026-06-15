const { Events, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const audit = require('./auditLogs');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== 'close_ticket_staff') return;

        // 🛑 SÉCURITÉ : VÉRIFICATION DES RÔLES
        const allowedRoles = ['1489901435863830548', '1489685700252143897'];
        const hasAllowedRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!hasAllowedRole && !isAdmin) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas la permission de fermer ce ticket. Seul le Staff est autorisé à le faire.", 
                ephemeral: true 
            });
        }

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

            // 3. RECHERCHE DU CRÉATEUR DU TICKET
            let originalUserId = interaction.user.id;
            let originalUserName = interaction.user.username;
            const dbPath = path.join(__dirname, '../ticketHistory.json');
            
            if (fs.existsSync(dbPath)) {
                try {
                    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                    const openLog = db.find(log => log.channelName === interaction.channel.name && log.action === 'OUVERTURE');
                    if (openLog) {
                        originalUserId = openLog.userId;
                        originalUserName = openLog.userName;
                    }
                } catch (err) {}
            }

            // 4. LOG Audit visuel
            audit.sendAuditLog(interaction.client, 'CLOSE', {
                user: `<@${interaction.user.id}>`,
                channelName: interaction.channel.name,
                action: 'Fermeture de ticket Staff'
            });

            // 5. SAUVEGARDE DB avec le vrai lien
            audit.saveTicket(
                originalUserId, 
                originalUserName, 
                interaction.channel.name, 
                `FERMETURE (par ${interaction.user.username})`, 
                fileWebLink
            );

            // 6. Suppression du salon
            setTimeout(() => interaction.channel.delete().catch(console.error), 3000);
        } catch (err) {
            console.error(err);
            interaction.followUp("❌ Erreur lors de l'archivage.");
        }
    }
};