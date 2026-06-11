const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'unsuspend',
    description: 'Réactive un ticket suspendu',

    async execute(message, args, client) {
        const userId = message.channel.topic;
        if (!userId) return message.reply("❌ Ce salon n'est pas un ticket valide.");

        const filePath = path.join(__dirname, '../functions/suspended.json');
        let suspended = [];
        if (fs.existsSync(filePath)) {
            suspended = JSON.parse(fs.readFileSync(filePath));
        }

        // 🛡️ SÉCURITÉ : Vérifier si le ticket est bien suspendu
        if (!suspended.includes(message.channel.id)) {
            return message.reply("⚠️ Ce ticket est **déjà actif** (il n'est pas suspendu).");
        }

        // 🛡️ SÉCURITÉ : On cherche si le joueur a un AUTRE ticket déjà ouvert (ACTIF)
        // On force le fetch pour être sûr du cache
        await message.guild.channels.fetch();
        const activeTicket = message.guild.channels.cache.find(c => 
            c.topic === userId && 
            c.id !== message.channel.id && 
            !suspended.includes(c.id)
        );

        if (activeTicket) {
            // Message corrigé : on ne propose plus de suspendre l'autre, car c'est impossible !
            return message.reply(`❌ **Action impossible.** Le citoyen a déjà un ticket en cours ici : <#${activeTicket.id}>.\nTu dois d'abord fermer ce ticket (\`!x\`) pour pouvoir réactiver celui-ci.`);
        }

        // Si tout est OK, on retire de la liste
        const newSuspendedList = suspended.filter(id => id !== message.channel.id);
        fs.writeFileSync(filePath, JSON.stringify(newSuspendedList, null, 2));

        await message.channel.send("▶️ **Ticket désuspendu.** Le citoyen est à nouveau lié à ce salon !");
    }
};