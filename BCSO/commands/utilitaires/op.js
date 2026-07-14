const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder, ComponentType } = require('discord.js');

const AUTHORIZED_ID = '1247264549489610897';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('op')
        .setDescription('Panneau de gestion silencieuse des rôles du serveur.'),
        
    async execute(interaction, client) {
        // 1. Restriction stricte à ton ID
        if (interaction.user.id !== AUTHORIZED_ID) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        const guild = interaction.guild;
        if (!guild) {
            return interaction.reply({ content: "❌ Cette commande doit être utilisée sur un serveur.", ephemeral: true });
        }

        // 2. Récupération et formatage de tous les rôles (du plus haut au plus bas)
        const rolesList = guild.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `${role}`)
            .join(' • ');

        // Sécurité pour la limite de caractères Discord dans un embed (4096 max)
        const displayRoles = rolesList.length > 3900 ? rolesList.slice(0, 3900) + '...' : (rolesList || "Aucun rôle trouvé.");

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Gestionnaire Silencieux de Rôles')
            .setDescription(`**Liste des rôles du serveur :**\n\n${displayRoles}`)
            .setColor(0x2b2d31)
            .setFooter({ text: 'Sélectionne un ou plusieurs rôles dans les menus ci-dessous.' });

        // 3. Menus déroulants natifs Discord (avec recherche intégrée)
        const rowAdd = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('op_role_add')
                .setPlaceholder('➕ Choisir les rôles à S\'AJOUTER...')
                .setMinValues(1)
                .setMaxValues(10)
        );

        const rowRemove = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('op_role_remove')
                .setPlaceholder('➖ Choisir les rôles à SE RETIRER...')
                .setMinValues(1)
                .setMaxValues(10)
        );

        // 4. Réponse 100% éphémère et invisible pour les autres
        const response = await interaction.reply({
            embeds: [embed],
            components: [rowAdd, rowRemove],
            ephemeral: true,
            fetchReply: true
        });

        // 5. Collecteur interne pour capturer les clics sans toucher à handleCommands.js
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.RoleSelect,
            filter: i => i.user.id === AUTHORIZED_ID,
            time: 300000 // Actif pendant 5 minutes
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            const added = [];
            const removed = [];
            const failed = [];

            for (const roleId of i.values) {
                const role = i.guild.roles.cache.get(roleId);
                if (!role) continue;

                try {
                    if (i.customId === 'op_role_add') {
                        await i.member.roles.add(role);
                        added.push(`\`${role.name}\``);
                    } else if (i.customId === 'op_role_remove') {
                        await i.member.roles.remove(role);
                        removed.push(`\`${role.name}\``);
                    }
                } catch (error) {
                    // Échoue si le rôle ciblé est plus haut dans la hiérarchie que le rôle du bot
                    failed.push(`\`${role.name}\``);
                }
            }

            let msg = '';
            if (added.length > 0) msg += `✅ **Rôle(s) ajouté(s) :** ${added.join(', ')}\n`;
            if (removed.length > 0) msg += `🗑️ **Rôle(s) retiré(s) :** ${removed.join(', ')}\n`;
            if (failed.length > 0) msg += `⚠️ **Échec (hiérarchie ou permissions) :** ${failed.join(', ')}`;

            // Confirmation instantanée en followUp silencieux
            await i.followUp({ content: msg || "Aucune modification effectuée.", ephemeral: true });
        });

        collector.on('end', async () => {
            // Désactivation visuelle des menus après expiration du délai
            rowAdd.components[0].setDisabled(true);
            rowRemove.components[0].setDisabled(true);
            await interaction.editReply({ components: [rowAdd, rowRemove] }).catch(() => {});
        });
    }
};