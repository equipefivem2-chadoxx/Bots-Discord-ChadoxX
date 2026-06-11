const ticketState = require('../functions/ticketState.js');

module.exports = {
    name: 'annul',
    description: 'Annule la fermeture automatique programmée d\'un ticket',

    async execute(message, args, client) {
        const channelId = message.channel.id;

        // On vérifie s'il y a un chronomètre en cours pour ce salon
        if (!ticketState.timers.has(channelId)) {
            return message.reply("⚠️ Il n'y a aucune fermeture programmée pour ce ticket.");
        }

        try {
            // On récupère le timeoutId et on l'arrête
            const timeoutId = ticketState.timers.get(channelId);
            clearTimeout(timeoutId);

            // On supprime l'entrée de la mémoire vive
            ticketState.timers.delete(channelId);

            // Message de confirmation en texte brut (pas d'embed)
            await message.channel.send("✅ **La fermeture automatique de ce ticket a été annulée.**");
            
        } catch (error) {
            console.error("Erreur lors de l'annulation de la fermeture :", error);
            message.reply("❌ Une erreur est survenue lors de l'annulation.");
        }
    }
};