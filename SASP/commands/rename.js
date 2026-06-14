module.exports = {
    name: 'rename',
    description: 'Renomme un dossier d\'opération.',
    async execute(message, args) {
        // ✨ MODIFICATION : Ajout des deux catégories (Sud et Nord)
        const allowedCategories = ['1489685701443452949', '1515658721609646183'];
        
        if (!allowedCategories.includes(message.channel.parentId)) {
            return message.reply("❌ Cette commande est réservée uniquement aux dossiers d'opération (Sud et Nord).");
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