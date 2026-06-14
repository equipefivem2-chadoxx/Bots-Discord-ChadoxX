const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'close',
    description: 'Ferme et supprime un dossier d\'opération.',
    async execute(message, args) {
        // Sécurité : On bloque la commande si on n'est pas dans la catégorie des dossiers d'opération
        const opsCategory = '1489685701443452949';
        if (message.channel.parentId !== opsCategory) {
            return message.reply("❌ Cette commande est réservée uniquement aux dossiers d'opération.");
        }

        // On vérifie que la personne a les droits de gérer le salon
        if (!message.member.permissionsIn(message.channel).has(PermissionFlagsBits.ManageChannels)) {
            return message.reply("❌ Tu n'as pas la permission de fermer ce dossier.");
        }

        await message.reply("⚠️ **Fermeture imminente.**\nSi ce n'est pas fait, n'oubliez pas votre `!transcript` !\n\n*Suppression du dossier dans 5 secondes...*");

        // Suppression du salon après 5 secondes
        setTimeout(() => {
            message.channel.delete().catch(err => console.error("Impossible de supprimer le ticket :", err));
        }, 5000);
    }
};