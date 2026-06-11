const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'mute',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Tu n'as pas la permission de rendre les membres muets.");
        }

        const targetId = args[0];
        if (!targetId) return message.reply("❌ Tu dois spécifier l'ID du membre à mute. `Ex: !mute 123456789 1d`");

        const target = await message.guild.members.fetch(targetId).catch(() => null);
        if (!target) return message.reply("❌ Membre introuvable sur le serveur.");

        // SÉCURITÉS SUPPLÉMENTAIRES
        if (target.id === message.author.id) return message.reply("❌ Tu ne peux pas te mute toi-même !");
        if (target.id === message.client.user.id) return message.reply("❌ Je ne peux pas me mute moi-même !");
        if (!target.manageable) return message.reply("❌ Le bot n'a pas les droits nécessaires sur ce membre (rôle du bot trop bas ou membre Administrateur).");

        const durationArg = args[1]; 
        
        // On fixe le mute par défaut à 27 jours pour éviter le bug limite de l'API Discord
        let durationMs = ms('27d'); 
        let displayDuration = 'Permanent (27 jours max)';

        if (durationArg) {
            const parsed = ms(durationArg);
            if (parsed) {
                // Discord refuse les timeouts de plus de 28 jours (2,419,200,000 ms)
                if (parsed > 2419200000) {
                    return message.reply("❌ Discord interdit de mute quelqu'un plus de 28 jours d'affilée.");
                }
                durationMs = parsed;
                displayDuration = durationArg;
            }
        }

        const reason = args.slice(durationArg ? 2 : 1).join(' ') || 'Aucune raison spécifiée';

        try {
            await target.timeout(durationMs, reason);

            const embed = new EmbedBuilder()
                .setTitle('🤐 Membre Rendu Muet')
                .setDescription(`<@${targetId}> a été mis sous silence.`)
                .addFields(
                    { name: 'Durée', value: displayDuration, inline: true },
                    { name: 'Raison', value: reason, inline: true }
                )
                .setColor('#f1c40f')
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            // Ce log dans la console t'aidera à comprendre l'erreur exacte
            message.reply("❌ Une erreur système a empêché le mute. Regarde la console (VS Code) pour les détails.");
        }
    },
};