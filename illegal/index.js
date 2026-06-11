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

// 🔄 Chargement "intelligent"
const tokensPath = path.join(__dirname, '../tokens.js');
const tokens = fs.existsSync(tokensPath) ? require(tokensPath) : process.env;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📂 Chargement commandes sécurisé
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== 'index.js');
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
    }
}

// 🚀 Déploiement automatique
async function deployCommands() {
    const commands = Array.from(client.commands.values()).map(c => c.data.toJSON());
    const token = tokens.TOKEN_ILLEGAL || process.env.TOKEN_ILLEGAL;
    
    if (!token) return console.error("❌ Token ILLEGAL manquant !");

    const rest = new REST({ version: '10' }).setToken(token);

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

client.once(Events.ClientReady, async () => {
    await deployCommands();
    console.log(`[ILLEGAL] ${client.user.tag} connecté`);
});

// 🎮 Interactions
client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        } else if (interaction.isButton() || interaction.isModalSubmit()) {
            for (const command of client.commands.values()) {
                if (interaction.isButton() && typeof command.button === 'function') await command.button(interaction);
                if (interaction.isModalSubmit() && typeof command.modal === 'function') await command.modal(interaction);
            }
        }
    } catch (error) {
        console.error(error);
    }
});

// Connexion sécurisée
const loginToken = tokens.TOKEN_ILLEGAL || process.env.TOKEN_ILLEGAL;
if (loginToken) {
    client.login(loginToken);
} else {
    console.error("❌ ERREUR FATALE : Token ILLEGAL introuvable.");
}