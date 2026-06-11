const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('embedcreate')
        .setDescription('Créer l’embed des groupes officiels')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        // 🔒 Rôles autorisés
        const allowedRoles = [
            '1487832660238794893',
            '1487832656040427633'
        ];

        const member = interaction.member;

        const hasRole = member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasRole) {

            return interaction.reply({
                content: '❌ Tu n’as pas la permission.',
                ephemeral: true
            });

        }

        // 📢 Salon cible
        const channel = interaction.guild.channels.cache.get('1487833104956784921');

        if (!channel) {

            return interaction.reply({
                content: '❌ Salon introuvable.',
                ephemeral: true
            });

        }

        // ✨ Embed
        const embed = new EmbedBuilder()

            .setColor('#0f1014')

            .setTitle('📁 • Création d’un Groupe Officiel')

            .setDescription(
`> Toute création de groupe officiel nécessite la réalisation d’un dossier complet sur **Google Slides** ou **Canva**.

> Le dossier doit présenter votre projet de manière **claire**, **organisée** et **détaillée**.

> La qualité de la présentation, l’originalité du concept ainsi que l’investissement fourni seront pris en compte lors de l’étude du dossier.`)

            .addFields(

                {
                    name: '📌 • Contenu obligatoire du dossier',
                    value:
`• Identité du groupe
• Histoire & contexte RP
• Objectifs & ambitions
• Activités prévues
• Lieu principal utilisé
• Tenues & éléments distinctifs
• Véhicules utilisés
• Organisation hiérarchique
• Expérience RP & HRP du Lead / Co-Lead
• Liste des membres + Discord
• Motivations du projet`,
                    inline: false
                },

                {
                    name: '⚠️ • Conditions',
                    value:
`• Les références à des organisations réelles sont interdites.
• Un dossier incomplet ou incohérent pourra être refusé.
• Le staff peut demander des informations complémentaires.`,
                    inline: false
                },

                {
                    name: '🧠 • Étude des candidatures',
                    value:
`Les dossiers sont étudiés selon plusieurs critères :

• Qualité générale
• Cohérence RP
• Sérieux du projet
• Implication des membres`,
                    inline: false
                },

                {
                    name: '📨 • Dépôt du dossier',
                    value:
`Lorsque des slots sont disponibles, envoyez directement votre dossier en **message privé** au bot <@1487866467146793032>.`,
                    inline: false
                },

{
    name: '════════════════════',
    value:
`🎯 **SLOTS DISPONIBLES**

 **X/X**`,
    inline: false
}

            )

            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))

            .setFooter({
                text: 'IrisFA • Illégal'
            })

            .setTimestamp();

        await channel.send({
            embeds: [embed]
        });

        await interaction.reply({
            content: '✅ Embed envoyé avec succès.',
            ephemeral: true
        });

    }

};