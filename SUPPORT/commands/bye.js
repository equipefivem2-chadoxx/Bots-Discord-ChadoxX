const modmailHandler = require('../functions/modmailHandler.js');

module.exports = {
    name: '!bye', // Captera la commande !!bye
    description: 'Envoie le message de fin au joueur',

    async execute(message, args, client) {
        // Le texte exact de fin
        const texte = "En espérant que ta demande ait été traitée correctement, nous te souhaitons une bonne continuation ainsi qu’un bon jeu sur IrisFA.\nMerci de ne pas répondre à ce message une fois le ticket fermé, cela entraînera l’ouverture d’un nouveau ticket.\nBien à toi,\n\n**L’équipe de modération IrisFA.**";
        
        const argumentsSimules = texte.split(' ');

        await message.delete().catch(() => {});

        return await modmailHandler.handleReply(message, argumentsSimules, client);
    }
};