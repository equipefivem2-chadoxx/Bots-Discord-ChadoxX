module.exports = {
    name: 'mv',
    description: 'Déplace le ticket dans une autre catégorie',

    async execute(message, args, client) {
        if (args.length === 0) return message.reply("❌ Précise une destination (Ex: `!mv police`).");

        const target = args.join(' ').toLowerCase();

        const categories = [
            { id: '1488478172050886760', name: '🔫・Illégal', keys: ['ill', 'illégal', 'illegal'] },
            { id: '1490486918507659436', name: '🏠 ・Immobilier', keys: ['immo', 'immobilier'] },
            { id: '1488477786300743782', name: '⚡・LM', keys: ['lm'] },
            { id: '1488478781533589564', name: '📞・Admin', keys: ['admin', 'administration'] },
            { id: '1488477840772042933', name: '👑・Fondateur', keys: ['fonda', 'fondateur', 'fond'] },
            { id: '1490147268676816986', name: '🩺・EMS', keys: ['ems', 'medecin', 'hopital'] },
            { id: '1488478120099971203', name: '👮・Police', keys: ['pol', 'police', 'lspd', 'sasp'] },
            { id: '1488478205621829652', name: '🏛️・Gouvernement', keys: ['gouv', 'gouvernement'] },
            { id: '1488478258667196426', name: '🏢・Entreprise', keys: ['entre', 'entreprise'] },
            { id: '1488478296873242675', name: '🎆・Événementiel', keys: ['event', 'evenementiel'] },
            { id: '1488581879312416979', name: '👤・wipes', keys: ['w', 'wipe', 'wipes'] },
            { id: '1488477918370988085', name: '🔄・Remboursements', keys: ['remb', 'remboursement'] },
            { id: '1488477965745520741', name: '⚠️・Plaintes', keys: ['plainte', 'plaintes'] },
            { id: '1488478059857182773', name: '⛔・Bannissemnts', keys: ['ban', 'bannissement'] },
            { id: '1490488310030663690', name: '⏳・En cours', keys: ['en c', 'en cours', 'encours'] },
            { id: '1488478822599753818', name: '🚩・Tickets', keys: ['ticket', 'tickets'] }
        ];

        let foundCategory = categories.find(cat => cat.keys.some(k => k.startsWith(target) || target.startsWith(k)));

        if (!foundCategory) return message.reply(`❌ Catégorie introuvable pour : \`${target}\`.`);

        try {
            await message.channel.setParent(foundCategory.id, { lockPermissions: false });
            
            // Envoi en format texte brut (sans embed)
            await message.channel.send(`Ticket déplacé dans la catégorie **${foundCategory.name}**.`);
            
        } catch (error) {
            console.error(error);
            message.reply("❌ Je n'ai pas la permission de déplacer ce salon ou l'ID est invalide.");
        }
    }
};