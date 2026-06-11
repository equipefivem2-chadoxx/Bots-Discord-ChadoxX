const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

client.commands = new Collection();

require('./src/handlers/eventHandler')(client);
require('./src/handlers/commandHandler')(client);

// Vérifie bien que cette variable correspond au nom dans ton interface Railway
client.login(process.env.DISCORD_TOKEN);