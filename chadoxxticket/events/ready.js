const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`🎟️ [ChadoxXTICKET] Connecté en tant que ${client.user.tag}`);

        try {
            await client.application.commands.set(client.commandArray);
            console.log(`✅ [ChadoxXTICKET] Slash commands déployées avec succès.`);
        } catch (error) {
            console.error(`❌ [ChadoxXTICKET] Erreur lors du déploiement des commandes :`, error);
        }
    },
};