//require('dotenv').config();

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

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📂 Chargement commandes
const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

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

    // CORRIGÉ : Utilisation de TOKEN_illegal
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_illegal);

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
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
        // 💬 Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        }
        // 🔘 Boutons
        else if (interaction.isButton()) {
            for (const command of client.commands.values()) {
                if (typeof command.button === 'function') {
                    await command.button(interaction);
                }
            }
        }
        // 📝 Modals
        else if (interaction.isModalSubmit()) {
            for (const command of client.commands.values()) {
                if (typeof command.modal === 'function') {
                    await command.modal(interaction);
                }
            }
        }
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            }).catch(() => {});
        } else {
            await interaction.reply({
                content: '❌ Une erreur est survenue.',
                ephemeral: true
            }).catch(() => {});
        }
    }
});

// CORRIGÉ : Utilisation de TOKEN_illegal
client.login(process.env.TOKEN_illegal);