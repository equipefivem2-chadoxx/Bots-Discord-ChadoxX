const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'rename',
    description: 'Renomme un dossier d\'opération.',
    async execute(message, args) {
        // Sécurité : On bloque la commande si on n'est pas dans la catégorie des dossiers d'opération
        const opsCategory = '1489685701443452949';
        if (message.channel.parentId !== opsCategory) {
            return message.reply("❌ Cette commande est réservée uniquement aux dossiers d'opération.");
        }

        if (args.length === 0) {
            return message.reply("⚠️ Usage : `!rename [nouveau nom]`\n*Exemple : !rename 🔴 braquage-banque*");
        }

        // On rassemble tous les mots tapés pour faire le nouveau nom
        const newName = args.join('-');

        try {
            await message.channel.setName(newName);
            await message.reply(`✅ Le dossier a été renommé en **${newName}** ! \n*(Note : Discord impose une limite de 2 changements de nom toutes les 10 minutes)*`);
        } catch (error) {
            console.error(error);
            await message.reply("❌ Une erreur est survenue lors du renommage du salon. Vérifie mes permissions.");
        }
    }
};