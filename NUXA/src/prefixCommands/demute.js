const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'demute',
    async execute(message, args) {
        // Sécurité : Vérifie si la personne a la permission d'exclure/dé-exclure
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Tu n'as pas la permission de rendre la parole aux membres.");
        }

        const targetId = args[0];
        if (!targetId) return message.reply("❌ Tu dois spécifier l'ID du membre à demute. `Ex: !demute 123456789`");

        // On cherche le membre sur le serveur
        const target = await message.guild.members.fetch(targetId).catch(() => null);
        if (!target) return message.reply("❌ Membre introuvable sur le serveur.");

        try {
            // En mettant le temps sur "null", ça retire instantanément le Timeout
            await target.timeout(null, 'Demute manuel par un modérateur');

            const embed = new EmbedBuilder()
                .setTitle('🔊 Membre Demute')
                .setDescription(`<@${targetId}> a retrouvé la parole.`)
                .setColor('#2ecc71') // Vert pour valider
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply("❌ Je n'ai pas pu demute ce membre (vérifie que mon rôle est plus haut que le sien !).");
        }
    },
};