const modmailHandler = require('../functions/modmailHandler.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // ON IGNORE LES MP ICI (Car raw.js s'en occupe pour éviter les doubles messages)
        if (!message.guild) return; 

        // COMMANDES STAFF SUR SERVEUR (!r, !close...)
        if (message.content.startsWith('!')) {
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (commandName === 'r') {
                return await modmailHandler.handleReply(message, args, client);
            }

            const command = client.commands.get(commandName);
            if (command) {
                try {
                    await command.execute(message, args, client);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
};