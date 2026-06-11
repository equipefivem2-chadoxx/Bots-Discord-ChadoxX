const fs = require('fs');
const path = require('path');
const {
    Client,
    Collection,
    GatewayIntentBits,
    Events,
    REST,
    Routes
} = require('discord.js');

// 🔄 Chargement "intelligent" : local (tokens.js) ou Railway (process.env)
const tokensPath = path.join(__dirname, '../tokens.js');
const tokens = fs.existsSync(tokensPath) ? require(tokensPath) : process.env;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📂 Chargement commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// 🚀 Déploiement automatique slash commands
async function deployCommands() {
    const commands = [];
    for (const command of client.commands.values()) {
        commands.push(command.data.toJSON());
    }

    // Utilisation dynamique du token
    const rest = new REST({ version: '10' }).setToken(tokens.TOKEN_ILLEGAL);

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                tokens.CLIENT_ID || process.env.CLIENT_ID,
                tokens.GUILD_ID || process.env.GUILD_ID
            ),
            { body: commands }
        );
    } catch (error) {
        console.error('❌ Erreur déploiement commandes :', error);
    }
}

// ✅ Bot prêt
client.once(Events.ClientReady, async () => {
    await deployCommands();
    console.log(`[ILLEGAL] ${client.user.tag} connecté`);
});

// 🎮 Interactions
client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        } else if (interaction.isButton()) {
            for (const command of client.commands.values()) {
                if (typeof command.button === 'function') await command.button(interaction);
            }
        } else if (interaction.isModalSubmit()) {
            for (const command of client.commands.values()) {
                if (typeof command.modal === 'function') await command.modal(interaction);
            }
        }
    } catch (error) {
        console.error(error);
        const payload = { content: '❌ Une erreur est survenue.', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
        else await interaction.reply(payload).catch(() => {});
    }
});

// Connexion dynamique
client.login(tokens.TOKEN_ILLEGAL);