const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'suspend',
    description: 'Met le ticket en suspens de façon instantanée',

    async execute(message, args, client) {
        const userId = message.channel.topic;
        if (!userId) return message.reply("❌ Ce salon n'est pas un ticket valide (aucun ID trouvé).");

        const filePath = path.join(__dirname, '../functions/suspended.json');
        let suspended = [];
        if (fs.existsSync(filePath)) {
            try {
                suspended = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch (e) {
                suspended = [];
            }
        }

        // 🛡️ SÉCURITÉ 1 : Ce ticket précis est-il déjà suspendu ?
        if (suspended.includes(message.channel.id)) {
            return message.reply("⚠️ Ce ticket est **déjà** en suspens.");
        }

        let foundSuspendedTicket = null;
        let cleanSuspended = []; // Servira à nettoyer les salons supprimés

        // 🛡️ SÉCURITÉ 2 : Recherche DIRECTE via l'API Discord (Zéro cache)
        for (const chanId of suspended) {
            try {
                // On fetch chaque salon un par un chez Discord
                const chan = await client.channels.fetch(chanId);
                if (chan) {
                    cleanSuspended.push(chanId); // Le salon existe toujours, on le garde
                    
                    if (chan.topic === userId) {
                        foundSuspendedTicket = chan; // On a trouvé le doublon !
                    }
                }
            } catch (err) {
                // Si ça fait une erreur, c'est que le salon a été supprimé (!x). 
                // On l'ignore, ce qui le supprimera automatiquement de la liste.
            }
        }

        // On met à jour la liste avec les salons nettoyés
        suspended = cleanSuspended;

        // Si on a trouvé un doublon, on bloque !
        if (foundSuspendedTicket) {
            fs.writeFileSync(filePath, JSON.stringify(suspended, null, 2)); // Sauvegarde du nettoyage
            return message.reply(`❌ **Action impossible.** Le citoyen a déjà un autre ticket en suspens ici : <#${foundSuspendedTicket.id}>.\nTu ne peux suspendre qu'un seul ticket par personne.`);
        }

        // Si tout est bon, on l'ajoute à la liste finale
        suspended.push(message.channel.id);
        fs.writeFileSync(filePath, JSON.stringify(suspended, null, 2));

        await message.channel.send("⏸️ **Ticket suspendu.** Le citoyen n'est plus lié à ce salon et peut désormais ouvrir un nouveau ticket.");
    }
};