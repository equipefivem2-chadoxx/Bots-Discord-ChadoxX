const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'open_op_ticket') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            
            // On récupère le pseudo spécifique au serveur (RP name) ou son username de base
            const pseudoServeur = interaction.member.displayName || interaction.user.username;
            
            // On remplace les espaces par des tirets, et on supprime les caractères non autorisés
            let cleanName = pseudoServeur.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

            // 🚀 SÉCURITÉ : Si le pseudo ne contenait que des émojis, cleanName est vide. On force un nom.
            if (!cleanName || cleanName === "") {
                cleanName = `agent-${interaction.user.id.slice(-4)}`;
            }

            const channelPermissions = [
                {
                    // 🚀 CORRECTION MAJEURE : On utilise everyone.id pour Discord.js v14
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                }
            ];

            if (config.allowedRolesCommand && Array.isArray(config.allowedRolesCommand)) {
                config.allowedRolesCommand.forEach(roleId => {
                    // Sécurité pour vérifier que l'ID n'est pas "ID_DU_ROLE_2" et est bien valide
                    if (roleId && roleId.length > 10) {
                        channelPermissions.push({
                            id: roleId,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                        });
                    }
                });
            }

            // Création du salon
            const ticketChannel = await guild.channels.create({
                name: `🟠-op-${cleanName}`,
                type: ChannelType.GuildText,
                parent: config.ticketCategoryId, 
                topic: pseudoServeur, // 🚀 AJOUT MAJEUR : On cache le nom du créateur dans le sujet du salon !
                permissionOverwrites: channelPermissions,
            });

            const embedInstructions = new EmbedBuilder()
                .setTitle("📁 DOSSIER D'OPÉRATION")
                .setDescription("Bienvenue dans ce dossier d'opération.\n⚠️ **A la fin vous devez le remplir dans son intégralité.** Vous en avez l'entière responsabilité.\n\n🛠️ **Commandes de gestion :**\n`/rename [nom]` • `/close`\n\n📊 **Codes Statut (à modifier dans le nom) :**\n🟢 Traité | 🔴 Non traité | 🟠 En cours | 🟡 Convoc. | ⛔ Ne pas fermer\n\n🧵 **Fils à ouvrir :** Suspects, Otages, Photos/Preuves, Voitures, Unités.\n\n**N'oubliez pas de rename le dossier dès le début de l'opération !**")
                .setColor('#E74C3C');

            const templateRapport = `╔════════════════════╗
🚨 TITRE OPÉRATION 🚨
╚════════════════════╝

📅 Date / Heure :
📍 Secteur :
⚖️ Infraction :

━━━━━━━━━━━━━━━━━━━━

👥 Suspects
• 
• 
• 

🎭 Otages
• 
• 
• 

🚗 Véhicules
• 
• 
• 

📢 Revendications
• 

━━━━━━━━━━━━━━━━━━━━

🎖️ Lead Terrain :
🤝 Lead Négociations :

━━━━━━━━━━━━━━━━━━━━

📝 Rapport d'Opération

Décrivez précisément les faits, le déroulement de l'intervention et son dénouement...

Compte-rendu :`;

            const embedTemplate = new EmbedBuilder()
                .setDescription(`*Copiez le bloc ci-dessous pour votre rapport d'opération :*\n\n\`\`\`markdown\n${templateRapport}\n\`\`\``)
                .setColor('#3498DB');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_op_ticket')
                    .setLabel('Fermer le dossier')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ 
                content: `📢 <@${interaction.user.id}> a ouvert un dossier d'opération !`, 
                embeds: [embedInstructions, embedTemplate],
                components: [row]
            });

            await interaction.editReply({ content: `✅ Ton dossier a été ouvert : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error("❌ ERREUR CRÉATION TICKET :", error);
            await interaction.editReply({ content: `❌ Erreur lors de la création du ticket. L'API Discord a bloqué la requête (vérifie les permissions et IDs).` });
        }
    });
};