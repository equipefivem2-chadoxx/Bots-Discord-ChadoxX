const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unban',
    async execute(message, args) {
        // Sécurité : Vérifie si la personne a la permission de bannir/débannir
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply("❌ Tu n'as pas la permission de débannir des membres.");
        }

        const targetId = args[0];
        if (!targetId) return message.reply("❌ Tu dois spécifier l'ID du membre à débannir. `Ex: !unban 123456789`");

        try {
            // On demande à Discord de retirer le ban
            await message.guild.members.unban(targetId);

            const embed = new EmbedBuilder()
                .setTitle('🕊️ Membre Débanni')
                .setDescription(`<@${targetId}> (${targetId}) a été débanni du serveur.`)
                .setColor('#2ecc71') // Vert pour valider
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply("❌ Impossible de débannir ce membre. Vérifie que l'ID est correct et qu'il est bien banni.");
        }
    },
};