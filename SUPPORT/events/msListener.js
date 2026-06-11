const fs = require('fs');
const path = require('path');
const modmailHandler = require('../functions/modmailHandler.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // On ignore les bots
        if (message.author.bot) return;

        const dbPath = path.join(__dirname, '../data/customMessages.json');
        if (!fs.existsSync(dbPath)) return; // Si la base n'existe pas encore, on s'arrête

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const content = message.content.trim();

        // Si le message exact (ex: "!!exemple") existe dans notre base de données
        if (db[content]) {
            const texte = db[content];
            const argumentsSimules = texte.split(' ');

            // On supprime la commande tapée par le staff
            await message.delete().catch(() => {});
            
            // On envoie au système modmail comme si c'était un !hi ou un !r
            await modmailHandler.handleReply(message, argumentsSimules, client);
        }
    }
};