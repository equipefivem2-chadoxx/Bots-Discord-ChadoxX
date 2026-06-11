const { REST, Routes } = require('discord.js');
const { clientId, guildIds, token } = require('./config.json');
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

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`⏳ Mise à jour des commandes SAMC sur ${guildIds.length} serveurs...`);

        for (const guildId of guildIds) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
            console.log(`✅ Succès pour le serveur : ${guildId}`);
        }
    } catch (error) {
        console.error(error);
    }
})();