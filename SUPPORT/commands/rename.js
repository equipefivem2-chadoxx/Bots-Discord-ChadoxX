module.exports = {
    name: 'rename',
    description: 'Renomme le ticket actuel',

    async execute(message, args, client) {
        // Sécurité : On vérifie qu'on est bien dans un ticket (grâce au topic)
        const userId = message.channel.topic;
        if (!userId) return message.reply("❌ Cette commande ne peut être utilisée que dans un ticket.");

        // Si le staff oublie de mettre un nom
        if (args.length === 0) {
            return message.reply("❌ Précise le nouveau nom (Ex: `!rename probleme-connexion`).");
        }

        // On assemble les mots avec des tirets (Discord remplace les espaces par des tirets pour les salons)
        const newName = args.join('-').toLowerCase();

        try {
            await message.channel.setName(newName);
            
            // Confirmation en texte brut
            await message.channel.send(`✅ Nom du ticket modifié en **${newName}**.`);
            
        } catch (error) {
            console.error("Erreur lors du renommage :", error);
            
            // Note importante : Discord limite le renommage des salons à 2 fois toutes les 10 minutes !
            message.reply("❌ Impossible de renommer le salon.\n*(Note : Discord impose une limite de 2 renommages par salon toutes les 10 minutes. Si tu viens de le faire, patiente un peu).*");
        }
    }
};