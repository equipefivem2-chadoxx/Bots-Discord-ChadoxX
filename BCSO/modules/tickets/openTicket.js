const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'open_op_ticket') return;

        // On fait patienter l'interaction
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const cleanName = interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

            // 1. Permissions (Les staffs voient le salon, mais sans être ping)
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

            // 2. Création du salon avec le tag 🟠 "En cours" par défaut
            const ticketChannel = await guild.channels.create({
                name: `🟠-op-${cleanName}`,
                type: ChannelType.GuildText,
                parent: config.ticketCategoryId, 
                permissionOverwrites: channelPermissions,
            });

            // 3. Construction du Premier Embed (Consignes)
            const embedInstructions = new EmbedBuilder()
                .setTitle("📁 DOSSIER D'OPÉRATION")
                .setDescription("Bienvenue dans ce dossier d'opération.\n⚠️ **A la fin vous devez le remplir dans son intégralité.** Vous en avez l'entière responsabilité.\n\n🛠️ **Commandes de gestion :**\n`!rename [nom]` • `!close`\n\n📊 **Codes Statut (à modifier dans le nom) :**\n🟢 Traité | 🔴 Non traité | 🟠 En cours | 🟡 Convoc. | ⛔ Ne pas fermer\n\n🧵 **Fils à ouvrir :** Identités Suspects, Otages, Photos, Voitures, Unités.\n\n**N'oubliez pas de rename le dossier dès le début de l'opération !**")
                .setColor('#E74C3C'); // Liseré Rouge

            // 4. Construction du Deuxième Embed (Le Template à copier)
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
                .setColor('#3498DB'); // Liseré Bleu

            // 5. Le Bouton de fermeture
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_op_ticket')
                    .setLabel('Fermer le dossier')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            // 6. Envoi final dans le ticket
            await ticketChannel.send({ 
                content: `📢 <@${interaction.user.id}> a ouvert un dossier d'opération !`, 
                embeds: [embedInstructions, embedTemplate],
                components: [row]
            });

            // Validation silencieuse pour l'utilisateur
            await interaction.editReply({ content: `✅ Ton dossier a été ouvert : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error("❌ ERREUR CRÉATION TICKET :", error);
            await interaction.editReply({ content: `❌ Erreur lors de la création du ticket. Vérifie tes configurations.` });
        }
    });
};