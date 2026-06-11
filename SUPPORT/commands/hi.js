const modmailHandler = require('../functions/modmailHandler.js');

module.exports = {
    name: '!hi', // Captera la commande !!hi
    description: 'Envoie le message de bienvenue au joueur',

    async execute(message, args, client) {
        // Le texte exact que tu souhaites envoyer
        const texte = "Salut,\nDis-nous ce dont tu as besoin pour améliorer ton expérience sur IrisFA, on est là pour t’aider !\nÀ très vite,\n\n**L’équipe IrisFA.**";
        
        // On transforme le texte en arguments (exactement comme si tu avais tapé !r Salut, Dis-nous...)
        const argumentsSimules = texte.split(' ');

        // On supprime le !!hi du staff pour garder le channel propre (optionnel mais recommandé)
        await message.delete().catch(() => {});

        // On envoie le tout à ton système Modmail qui s'occupera de l'envoyer au joueur !
        return await modmailHandler.handleReply(message, argumentsSimules, client);
    }
};