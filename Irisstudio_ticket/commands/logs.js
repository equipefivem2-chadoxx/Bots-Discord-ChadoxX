const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Affiche l\'historique des tickets d\'un utilisateur.')
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('Le membre dont tu veux vérifier l\'historique')
                .setRequired(true)
        )
        // Seuls les membres avec la permission de gérer les messages peuvent voir la commande (ex: Staff)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
    async execute(interaction) {
        const targetUser = interaction.options.getUser('utilisateur');
        const dbPath = path.join(__dirname, '..', 'data', 'tickets.json');

        // Vérifie si la base de données existe
        if (!fs.existsSync(dbPath)) {
            return interaction.reply({ content: "📂 Aucun historique de ticket n'a encore été enregistré sur le serveur.", ephemeral: true });
        }

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const userLogs = db[targetUser.id];

        // Si l'utilisateur n'a aucun ticket dans l'historique
        if (!userLogs || userLogs.length === 0) {
            return interaction.reply({ content: `📂 **${targetUser.username}** n'a aucun historique de ticket fermé.`, ephemeral: true });
        }

        const goldColor = '#d4af37';
        const embed = new EmbedBuilder()
            .setColor(goldColor)
            .setAuthor({ name: `Historique des tickets de ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
            .setDescription(`Voici les **${userLogs.length}** derniers tickets fermés pour cet utilisateur :`)
            .setThumbnail(interaction.guild.iconURL());

        // On crée une liste propre avec des liens cliquables
        let logText = "";
        // On inverse le tableau pour avoir les plus récents en premier (limité aux 10 derniers pour ne pas spam)
        const recentLogs = userLogs.slice(-10).reverse(); 

        recentLogs.forEach((log, index) => {
            logText += `**${index + 1}.** \`${log.name}\` (le ${log.date})\n`;
            logText += `↳ 🔒 Fermé par <@${log.closedBy}>\n`;
            logText += `↳ 🔗 [**Clique ici pour voir le Transcript HTML**](${log.url})\n\n`;
        });

        embed.addFields({ name: '📂 Archives', value: logText });

        await interaction.reply({ embeds: [embed], ephemeral: true }); // Ephémère pour ne pas polluer le salon
    }
};