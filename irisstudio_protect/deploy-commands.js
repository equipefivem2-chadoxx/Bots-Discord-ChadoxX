const { REST, Routes } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

// Remplace "TON_CLIENT_ID" par l'ID de ton bot Irisstudio_ticket
const clientId = 'TON_CLIENT_ID'; 

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log(`Début du déploiement de ${commands.length} commandes (/).`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log(`✅ Déploiement réussi de ${data.length} commandes (/).`);
    } catch (error) {
        console.error(error);
    }
})();