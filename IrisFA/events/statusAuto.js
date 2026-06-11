const statusManager = require('../functions/statusManager.js');

module.exports = {
    name: 'clientReady', // Passage en clientReady pour supprimer les alertes système
    once: true,
    execute(client) {
        console.log("📡 [STATUS] Système de surveillance IrisFA démarré !");
        statusManager.checkStatus(client);

        setInterval(() => {
            statusManager.checkStatus(client);
        }, 300000); 
    },
};