module.exports = {
    // On utilise 'clientReady' directement pour supprimer le warning de version
    name: 'clientReady', 
    once: true,
    execute(client) {
        console.log(`👁️ Le bot principal IrisFA est en ligne ! Connecté : ${client.user.tag}`);
    },
};