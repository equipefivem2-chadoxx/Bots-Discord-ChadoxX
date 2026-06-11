const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('embedreglement')
        .setDescription('Envoyer l’embed du règlement'),

    async execute(interaction) {

        // 🔒 Rôles autorisés
        const allowedRoles = [
            '1487832660238794893',
            '1487832656040427633'
        ];

        const hasRole = interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasRole) {

            return interaction.reply({
                content: '❌ Tu n’as pas la permission.',
                ephemeral: true
            });

        }

        // 📢 Salon cible
        const channel = interaction.guild.channels.cache.get('1487833130688581682');

        if (!channel) {

            return interaction.reply({
                content: '❌ Salon introuvable.',
                ephemeral: true
            });

        }

        // ✨ Embed
        const embed = new EmbedBuilder()

            .setColor('#111214')

            .setDescription(
`# 📘 • RÈGLEMENT ILLÉGAL

Veuillez prendre connaissance du règlement illégal avant toute activité RP.

> Le règlement est obligatoire pour l’ensemble des joueurs participant aux scènes illégales.

> Toute infraction au règlement peut entraîner des sanctions administratives ou RP.

ㅤ

## ⚠️ • IMPORTANT

Le règlement peut être modifié à tout moment via les annonces et hotfix du serveur.

Merci de vérifier régulièrement les mises à jour.`
            )

            .setFooter({
                text: 'IrisFA • Illégal'
            })

            .setTimestamp();

        // 🔘 Bouton lien
        const button = new ButtonBuilder()
            .setLabel('Consulter le règlement')
            .setStyle(ButtonStyle.Link)
            .setURL('https://irisfa.netlify.app/rules#illegal-hub');

        const row = new ActionRowBuilder()
            .addComponents(button);

        // 📤 Envoi
        await channel.send({
            embeds: [embed],
            components: [row]
        });

        // ✅ Confirmation
        await interaction.reply({
            content: '✅ Embed du règlement envoyé.',
            ephemeral: true
        });

    }

};