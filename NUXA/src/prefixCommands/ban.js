const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'ban',
    async execute(message, args) {
        // Sécurité : Vérifie si la personne a la permission de bannir
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply("❌ Tu n'as pas la permission de bannir des membres.");
        }

        const targetId = args[0];
        if (!targetId) return message.reply("❌ Tu dois spécifier l'ID du membre à bannir. `Ex: !ban 123456789 1d`");

        const target = await message.guild.members.fetch(targetId).catch(() => null);
        if (!target) return message.reply("❌ Membre introuvable sur le serveur.");

        const durationArg = args[1]; // Ex: '1d', '1m'
        let durationMs = null;
        if (durationArg) {
            durationMs = ms(durationArg);
            if (!durationMs) return message.reply("❌ Durée invalide. Utilise `1d`, `1h`, `1m` etc.");
        }

        const reason = args.slice(durationArg ? 2 : 1).join(' ') || 'Aucune raison spécifiée';

        try {
            await target.ban({ reason: reason });

            const embed = new EmbedBuilder()
                .setTitle('🔨 Membre Banni')
                .setDescription(`<@${targetId}> a été banni.`)
                .addFields(
                    { name: 'Durée', value: durationArg ? durationArg : 'Permanente', inline: true },
                    { name: 'Raison', value: reason, inline: true }
                )
                .setColor('#e74c3c')
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Si c'est un ban temporaire, on programme le débannissement
            if (durationMs) {
                setTimeout(async () => {
                    await message.guild.members.unban(targetId, 'Fin du ban temporaire').catch(() => null);
                }, durationMs);
            }

        } catch (error) {
            console.error(error);
            message.reply("❌ Je n'ai pas pu bannir ce membre (vérifie que mon rôle est plus haut que le sien !).");
        }
    },
};