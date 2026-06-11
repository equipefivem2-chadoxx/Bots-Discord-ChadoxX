const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🏛️ Bot GOUVERNEMENT en ligne !`);
        // La ligne setActivity a été supprimée, le bot n'aura plus de texte sous son nom.
    },
};