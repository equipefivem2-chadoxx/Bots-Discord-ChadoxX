module.exports = {
    name: 'rename',
    description: 'Renomme un dossier d\'opération.',
    async execute(message, args) {
        // Sécurité
        const opsCategory = '1489685701443452949';
        if (message.channel.parentId !== opsCategory) {
            return message.reply("❌ Cette commande est réservée uniquement aux dossiers d'opération.");
        }

        if (args.length === 0) {
            return message.reply("⚠️ Usage : `!rename [nouveau nom]`");
        }

        const newName = args.join('-');

        try {
            await message.channel.setName(newName);
            await message.reply(`✅ Le dossier a été renommé en **${newName}** !`);
        } catch (error) {
            console.error(error);
            await message.reply("❌ Une erreur est survenue lors du renommage du salon.");
        }
    }
};