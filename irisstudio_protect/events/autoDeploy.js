const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.ClientReady, // S'exécute au démarrage
    once: true,
    async execute(client) {
        const commands = [];
        // On remonte d'un dossier (..) pour aller chercher le dossier commands
        const commandsPath = path.join(__dirname, '..', 'commands');
        
        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(path.join(commandsPath, file));
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                }
            }
        }

        try {
            console.log(`[AUTO-DÉPLOIEMENT] Synchronisation de ${commands.length} commandes (/) en cours...`);
            
            // Met à jour les commandes globalement pour le bot
            await client.application.commands.set(commands);
            
            console.log(`✅ [AUTO-DÉPLOIEMENT] ${commands.length} commandes (/) ont été synchronisées avec succès !`);
        } catch (error) {
            console.error(`❌ [AUTO-DÉPLOIEMENT] Erreur lors de la synchronisation :`, error);
        }
    },
};