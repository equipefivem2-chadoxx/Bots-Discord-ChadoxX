const { ChannelType, PermissionsBitField } = require('discord.js');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'open_op_ticket') return;

        // On dit à Discord qu'on traite la demande
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const cleanName = interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

            // 1. On prépare les permissions de base (le serveur caché + le créateur autorisé)
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

            // 2. On ajoute dynamiquement les rôles de ton tableau allowedRolesCommand
            config.allowedRolesCommand.forEach(roleId => {
                // Filtre de sécurité : on ignore l'ID par défaut si tu ne l'as pas remplacé
                if (roleId && roleId !== "ID_DU_ROLE_2") {
                    channelPermissions.push({
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                    });
                }
            });

            // 3. Création du salon avec nos permissions dynamiques
            const ticketChannel = await guild.channels.create({
                name: `ticket-opération-${cleanName}`,
                type: ChannelType.GuildText,
                parent: config.ticketCategoryId, 
                permissionOverwrites: channelPermissions,
            });

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

            // 4. On prépare les mentions (pings) pour tous les rôles autorisés
            const rolesToPing = config.allowedRolesCommand
                .filter(id => id !== "ID_DU_ROLE_2")
                .map(id => `<@&${id}>`)
                .join(' ');

            await ticketChannel.send({ 
                // Le bot va ping le créateur et tous les rôles du tableau
                content: `Salut <@${interaction.user.id}> | ${rolesToPing}\nVoici votre formulaire d'opération à remplir :\n\n\`\`\`text\n${templateRapport}\n\`\`\``
            });

            // Validation finale
            await interaction.editReply({ content: `✅ Ton dossier a été ouvert : <#${ticketChannel.id}>` });

        } catch (error) {
            console.error("❌ ERREUR CRÉATION TICKET :", error);
            await interaction.editReply({ content: `❌ Erreur lors de la création du ticket. Vérifie que le bot a la permission "Gérer les salons" et que les IDs dans config.js sont corrects.` });
        }
    });
};