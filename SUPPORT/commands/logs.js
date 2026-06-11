const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'logs',
    description: 'Affiche les liens vers les conversations des tickets',

    async execute(message, args, client) {
        let targetId = args[0];
        
        if (!targetId) {
            if (message.channel.topic && !isNaN(message.channel.topic)) {
                targetId = message.channel.topic;
            } else {
                return message.reply("❌ Précise un ID (`!logs <id>`) ou fais-le dans le ticket du joueur.");
            }
        }

        const dbPath = path.join(__dirname, '../data/ticketLogs.json');
        if (!fs.existsSync(dbPath)) return message.reply(`📄 L'utilisateur \`${targetId}\` n'a aucun historique.`);

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const userLogs = db[targetId];

        if (!userLogs || userLogs.length === 0) {
            return message.reply(`📄 L'utilisateur \`${targetId}\` n'a aucun historique enregistré.`);
        }

        let finalText = `📜 **Logs des tickets pour \`${targetId}\`**\n\n`;

        // On affiche les 15 derniers pour avoir une belle liste
        const recentLogs = userLogs.slice(-15).reverse();

        recentLogs.forEach((log) => {
            const date = new Date(log.closedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });
            
            // On vérifie s'il y a bien un lien enregistré
            if (log.url && log.url !== "Aucun lien généré") {
                finalText += `🔗 **[Lire le ticket du ${date}](${log.url})**\n`;
            } else {
                finalText += `❌ *Ticket du ${date} (Fichier texte non généré)*\n`;
            }
        });

        return message.reply({ content: finalText });
    }
};