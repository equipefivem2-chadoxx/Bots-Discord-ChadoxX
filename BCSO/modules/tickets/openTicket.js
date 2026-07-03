const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'open_op_ticket') return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            
            // 🔄 CHANGEMENT ICI : On récupère le pseudo spécifique au serveur (RP name)
            const pseudoServeur = interaction.member.displayName;
            
            // On remplace les espaces par des tirets, et on supprime les caractères non autorisés (crochets, etc.)
            // Exemple : "[41] - Jesse Langston" deviendra "41-jesse-langston"
            const cleanName = pseudoServeur.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

            const channelPermissions = [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                }
            ];

            config.allowedRolesCommand.forEach(roleId => {
                if (roleId && roleId !== "ID_DU_ROLE_2") {
                    channelPermissions.push({
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                    });
                }
            });

            // Création du salon avec le tag 🟠 et le pseudo RP
            const ticketChannel = await guild.channels.create({
                name: `🟠-op-${cleanName}`,
                type: ChannelType.GuildText,
                parent: config.ticketCategoryId, 
                permissionOverwrites: channelPermissions,
            });

            const embedInstructions = new EmbedBuilder()
                .setTitle("📁 DOSSIER D'OPÉRATION")
                .setDescription("Bienvenue dans ce dossier d'opération.\n⚠️ **A la fin vous devez le remplir dans son intégralité.** Vous en avez l'entière responsabilité.\n\n🛠️ **Commandes de gestion :**\n`!rename [nom]` • `!close`\n\n📊 **Codes Statut (à modifier dans le nom) :**\n🟢 Traité | 🔴 Non traité | 🟠 En cours | 🟡 Convoc. | ⛔ Ne pas fermer\n\n🧵 **Fils à ouvrir :** Identités Suspects, Otages, Photos, Voitures, Unités.\n\n**N'oubliez pas de rename le dossier dès le début de l'opération !**")
                .setColor('#E74C3C');

            const templateRapport = `╔════════════════════╗
🚨 OPÉRATION 🚨
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
                // La mention <@ID> affichera automatiquement le pseudo du serveur dans le chat Discord
                content: `📢 <@${interaction.user.id}> a ouvert un dossier d'opération !`, 
                embeds: [embedInstructions, embedTemplate],
                components: [row]
            });

            await interaction.editReply({ content: `✅ Ton dossier a été ouvert : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error("❌ ERREUR CRÉATION TICKET :", error);
            await interaction.editReply({ content: `❌ Erreur lors de la création du ticket. Vérifie tes configurations.` });
        }
    });
};