const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const ticketState = require('../functions/ticketState.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'x',
    description: 'Ferme le ticket (immédiatement ou avec délai). Option -s pour ne pas notifier le joueur.',

    async execute(message, args, client) {
        const LOG_CHANNEL_ID = '1491944561742708786';
        if (!message.channel.name.toLowerCase().match(/^[a-z0-9_-]+$/)) return; 

        const userId = message.channel.topic;

        // 🤫 DÉTECTION DU MODE SILENCIEUX
        const isSilent = args.includes('-s');
        const filteredArgs = args.filter(a => a !== '-s'); 

        // --- 📝 FONCTION DE SAUVEGARDE PRO (CORRIGÉE POUR LES EMBEDS) ---
        const performLogSave = async () => {
            if (!userId || isNaN(userId)) return;
            try {
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

                let transcript = `==========================================\n`;
                transcript += `       LOGS DE TICKET - IRISFA SUPPORT\n`;
                transcript += `==========================================\n\n`;
                transcript += `👤 CITOYEN ID : ${userId}\n`;
                transcript += `🛡️ FERMÉ PAR  : ${message.author.tag}\n`;
                transcript += `📅 LE        : ${new Date().toLocaleString('fr-FR')}\n`;
                transcript += `\n------------------------------------------\n\n`;
                
                sorted.forEach(m => {
                    const date = new Date(m.createdAt).toLocaleString('fr-FR');
                    
                    // --- 🔍 EXTRACTION DU CONTENU (TEXTE OU EMBED) ---
                    let cleanContent = m.content || "";

                    // Si le message est vide mais contient un Embed (cas des messages du joueur)
                    if (!cleanContent && m.embeds.length > 0 && m.embeds[0].description) {
                        cleanContent = m.embeds[0].description;
                    }

                    // Nettoyage des symboles Discord pour le web
                    cleanContent = cleanContent.replace(/\*\*/g, '').replace(/__/g, '').replace(/`/g, '');
                    
                    if (!cleanContent && m.attachments.size > 0) cleanContent = "[Image ou Pièce Jointe]";
                    if (!cleanContent) return; // On ignore les messages de logs systèmes vides

                    // Détection de l'auteur (Si c'est le bot avec un Embed, c'est le Joueur)
                    let authorDisplay = m.author.username.toUpperCase();
                    if (m.author.bot && m.embeds.length > 0 && m.embeds[0].author) {
                        authorDisplay = `JOUEUR (${m.embeds[0].author.name.toUpperCase()})`;
                    }

                    transcript += `[${date}] ${authorDisplay} :\n   > ${cleanContent}\n\n`;
                });

                transcript += `\n==========================================\n           FIN DU TICKET\n==========================================`;

                // Lien Web via pste.ch
                let webUrl = "Lien indisponible";
                try {
                    const res = await fetch('https://pste.ch/documents', { method: 'POST', body: transcript });
                    const data = await res.json();
                    if (data.key) webUrl = `https://pste.ch/${data.key}`;
                } catch (err) {}

                // Envoi au salon de logs
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
                if (logChannel) {
                    const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: `log-${userId}.txt` });
                    await logChannel.send({ 
                        content: `📁 **Archive Ticket** | Citoyen : <@${userId}>\n🔗 **Lien Web :** ${webUrl}`, 
                        files: [attachment] 
                    });
                }

                // Sauvegarde DB pour !logs
                const dbPath = path.join(__dirname, '../data/ticketLogs.json');
                const db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {};
                if (!db[userId]) db[userId] = [];
                db[userId].push({
                    closedAt: Date.now(),
                    closedBy: message.author.id,
                    reason: isSilent ? "Fermeture silencieuse" : "Fermeture standard",
                    url: webUrl
                });
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
            } catch (e) { console.error(e); }
        };

        // --- 1. FERMETURE IMMÉDIATE (!x ou !x -s) ---
        if (filteredArgs.length === 0) {
            await performLogSave(); // On lance la sauvegarde

            if (userId && !isSilent) {
                try {
                    const user = await client.users.fetch(userId);
                    const closeEmbed = new EmbedBuilder()
                        .setColor('#E6D5B8')
                        .setDescription("Nous espérons que ton ticket a été correctement traité.\nSi tout est en ordre, tu n’as pas besoin de répondre à ce message.\n\nMerci et amuse-toi bien sur IrisFA !");
                    await user.send({ embeds: [closeEmbed] });
                } catch (err) {}
            }

            const statusMsg = isSilent ? "🔒 **Clôture silencieuse.**" : "🔒 **Le ticket a été clôturé.**";
            await message.channel.send(`${statusMsg} Suppression du salon dans 5 secondes...`);
            
            setTimeout(() => message.channel.delete().catch(() => {}), 5000);
            return;
        }

        // --- 2. FERMETURE DIFFÉRÉE (!x 10, !x 1h, etc.) ---
        let timeArg = filteredArgs[0].toLowerCase();
        let ms = 0;
        let timeLabel = "";

        if (timeArg.endsWith('d')) {
            ms = parseInt(timeArg) * 86400000;
            timeLabel = `${parseInt(timeArg)} jour(s)`;
        } else if (timeArg.endsWith('h')) {
            ms = parseInt(timeArg) * 3600000;
            timeLabel = `${parseInt(timeArg)} heure(s)`;
        } else {
            let mins = parseInt(timeArg.replace('m', ''));
            ms = mins * 60000;
            timeLabel = `${mins} minute(s)`;
        }

        if (isNaN(ms) || ms <= 0) return message.reply("❌ Format de temps invalide (Ex: `!x 10`, `!x 2h -s`).");

        if (ticketState.timers.has(message.channel.id)) {
            clearTimeout(ticketState.timers.get(message.channel.id));
        }

        const timeoutId = setTimeout(async () => {
            await performLogSave(); // Sauvegarde lors de la fin du timer

            if (userId && !isSilent) {
                try {
                    const user = await client.users.fetch(userId);
                    const closeEmbed = new EmbedBuilder()
                        .setColor('#E6D5B8')
                        .setDescription("Nous espérons que ton ticket a été correctement traité.\nSi tout est en ordre, tu n’as pas besoin de répondre à ce message.\n\nMerci et amuse-toi bien sur IrisFA !");
                    await user.send({ embeds: [closeEmbed] });
                } catch (err) {}
            }
            await message.channel.delete().catch(() => {});
            ticketState.timers.delete(message.channel.id);
        }, ms);

        ticketState.timers.set(message.channel.id, timeoutId);

        const silentLabel = isSilent ? " (Silencieux)" : "";
        await message.channel.send(`⏳ Ce ticket se fermera automatiquement dans **${timeLabel}**${silentLabel}.\n*(Si le citoyen renvoie un message, la fermeture sera annulée)*`);
    }
};