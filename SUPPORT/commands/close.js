const { EmbedBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'close',
    description: 'Ferme le ticket et génère un log',

    async execute(message, args, client) {
        const LOG_CHANNEL_ID = '1491944561742708786'; 
        const userId = message.channel.topic;

        // --- ÉTAPE 1 : VÉRIFICATION DU TOPIC ---
        if (!userId) {
            return message.reply("❌ **Erreur :** Le sujet (topic) de ce salon est vide. Je ne peux pas trouver l'ID du joueur.");
        }

        await message.channel.send("🔍 *Génération du log en cours...*");

        // --- ÉTAPE 2 : GÉNÉRATION DU TEXTE ---
        let transcriptText = `--- LOGS DU TICKET ---\nCitoyen ID: ${userId}\nFermé par: ${message.author.tag}\n\n`;
        
        try {
            const messages = await message.channel.messages.fetch({ limit: 100 });
            const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            sorted.forEach(m => {
                const date = new Date(m.createdAt).toLocaleString('fr-FR');
                transcriptText += `[${date}] ${m.author.username}: ${m.content || "[Fichier/Embed]"}\n`;
            });
        } catch (err) {
            return message.channel.send("❌ **Erreur :** Impossible de lire les messages du salon.");
        }

        // --- ÉTAPE 3 : ENVOI AU SALON LOGS ---
        let transcriptUrl = "Aucun lien généré";
        try {
            const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
            
            if (!logChannel) {
                await message.channel.send(`❌ **Erreur :** Je ne trouve pas le salon de logs (ID: ${LOG_CHANNEL_ID}). Vérifie l'ID !`);
            } else {
                // On vérifie si le bot peut écrire dedans
                const permissions = logChannel.permissionsFor(client.user);
                if (!permissions.has(PermissionFlagsBits.SendMessages) || !permissions.has(PermissionFlagsBits.AttachFiles)) {
                    await message.channel.send(`❌ **Erreur :** Je n'ai pas la permission d'envoyer des fichiers dans <#${LOG_CHANNEL_ID}>.`);
                } else {
                    const attachment = new AttachmentBuilder(Buffer.from(transcriptText, 'utf-8'), { name: `log-${userId}.txt` });
                    const logMsg = await logChannel.send({ 
                        content: `📁 **Archive Ticket** | Citoyen : <@${userId}>`, 
                        files: [attachment] 
                    });
                    transcriptUrl = logMsg.attachments.first().url;
                    await message.channel.send("✅ *Log sauvegardé avec succès.*");
                }
            }
        } catch (err) {
            await message.channel.send(`❌ **Erreur critique :** ${err.message}`);
        }

        // --- ÉTAPE 4 : BASE DE DONNÉES ---
        try {
            const dataDir = path.join(__dirname, '../data');
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
            const dbPath = path.join(dataDir, 'ticketLogs.json');
            if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

            const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[userId]) db[userId] = []; 
            db[userId].push({
                closedAt: Date.now(),
                closedBy: message.author.id,
                reason: args.join(' ') || "Aucune raison",
                url: transcriptUrl
            });
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
        } catch (err) {
            console.error("Erreur DB:", err);
        }

        // --- ÉTAPE 5 : SUPPRESSION ---
        const closingEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setDescription('Suppression du salon dans 5 secondes...');

        await message.channel.send({ embeds: [closingEmbed] });

        setTimeout(async () => {
            await message.channel.delete().catch(() => {});
        }, 5000);
    }
};