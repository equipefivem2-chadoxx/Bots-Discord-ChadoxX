const statusManager = require('../functions/statusManager.js');

module.exports = {
    name: 'teststatus',
    description: 'Force un changement de statut pour tester le style',

    async execute(message, args) { // On retire 'client' des arguments ici
        const type = args[0]?.toUpperCase(); 
        
        const validTypes = ["ON", "OFF", "CRASH", "REBOOT"];
        if (!validTypes.includes(type)) {
            return message.reply("❌ Utilise : `!teststatus ON`, `OFF`, `CRASH` ou `REBOOT`.");
        }

        // On passe 'message.client' au manager
        await statusManager.checkStatus(message.client, type);
        message.reply(`✅ Test envoyé pour le statut : **${type}**`);
    }
};