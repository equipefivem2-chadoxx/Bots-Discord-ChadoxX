const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setrc',
    description: 'Ouvre ou ferme les recrutements SASP sur le site web.',
    
    async execute(message, args, client) {
        // Sécurité : Vérifie que l'utilisateur a les permissions
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply("❌ Permission refusée.");
        }

        const etat = args[0]?.toLowerCase();
        if (etat !== 'on' && etat !== 'off') {
            return message.reply("⚠️ Utilisation correcte : `!setrc on` ou `!setrc off`");
        }

        const isOpen = etat === 'on';
        const statusPath = path.join(__dirname, '../api/status.json');

        // Modification modulaire du fichier d'état
        fs.writeFileSync(statusPath, JSON.stringify({ isOpen }), 'utf8');

        const embed = new EmbedBuilder()
            .setColor(isOpen ? '#2ECC71' : '#E74C3C')
            .setTitle(`🚔 RECRUTEMENTS SASP : ${isOpen ? 'OUVERTS' : 'FERMÉS'}`)
            .setDescription(`Le site redirigera désormais les joueurs vers **${isOpen ? 'recrutement-on.html' : 'recrutement-off.html'}**.`);

        await message.reply({ embeds: [embed] });
    }
};