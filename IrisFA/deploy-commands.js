const { REST, Routes } = require('discord.js');
const { token, clientId, guildIds } = require('./config.json'); // On récupère la liste 'guildIds'
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`⏳ Début de l'actualisation pour ${guildIds.length} serveurs...`);

        // On boucle sur chaque ID de serveur présent dans ton config.json
        for (const guildId of guildIds) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
            console.log(`✅ Commandes enregistrées pour le serveur : ${guildId}`);
        }

        console.log('✨ Mission terminée ! Toutes les commandes sont à jour.');
    } catch (error) {
        console.error("❌ Erreur lors du déploiement :", error);
    }
})();