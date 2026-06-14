const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Supprime un nombre spécifique de messages.',
    async execute(message, args) {
        // 1. SÉCURITÉ : Vérification des permissions
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("❌ Tu n'as pas la permission de gérer les messages.");
        }

        // 2. VÉRIFICATION DU NOMBRE
        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply("⚠️ Merci de spécifier un nombre entre 1 et 100.");
        }

        // 3. EXÉCUTION
        try {
            // On supprime le message de la commande + les messages précédents
            await message.channel.bulkDelete(amount + 1, true);
            
            // On envoie une confirmation temporaire
            const confirmation = await message.channel.send(`✅ ${amount} messages supprimés.`);
            
            // Suppression automatique du message de confirmation après 3 secondes
            setTimeout(() => confirmation.delete().catch(() => {}), 3000);
            
        } catch (error) {
            console.error(error);
            return message.reply("❌ Une erreur est survenue lors de la suppression. Note : je ne peux pas supprimer les messages de plus de 14 jours.");
        }
    }
};