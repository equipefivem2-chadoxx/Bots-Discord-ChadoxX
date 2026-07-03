const { ChannelType, PermissionsBitField } = require('discord.js');
const config = require('../../config.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'open_op_ticket') return;

        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        
        // Nettoyage du pseudo (retire les caractères spéciaux et les espaces)
        const cleanName = interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        // Création du salon de ticket avec le nouveau nom
        const ticketChannel = await guild.channels.create({
            name: `ticket-opération-${cleanName}`,
            type: ChannelType.GuildText,
            parent: config.ticketCategoryId,
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone ne voit rien
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id, // L'agent voit son ticket
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                },
                {
                    id: config.bcsoRoleId, // Les hauts gradés BCSO voient le ticket
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles],
                }
            ],
        });

        // Ton template de rapport exact
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

        // Le bot ping le créateur et le rôle BCSO, puis envoie le formulaire
        await ticketChannel.send({ 
            content: `Salut <@${interaction.user.id}> | <@&${config.bcsoRoleId}>\nVoici votre formulaire d'opération à remplir :\n\n\`\`\`text\n${templateRapport}\n\`\`\``
        });

        // Confirme à l'utilisateur que le salon est prêt
        await interaction.editReply({ content: `✅ Ton dossier a été ouvert : <#${ticketChannel.id}>` });
    });
};