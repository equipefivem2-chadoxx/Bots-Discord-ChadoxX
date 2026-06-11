const { Events, MessageFlags, EmbedBuilder } = require('discord.js');
const staffHandler = require('../functions/staffHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        
        // 1. Gestion des Slash Commands (/)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                // On passe bien 'client' ici
                await command.execute(interaction, client);
            } catch (error) {
                console.error("❌ Erreur commande Slash :", error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: "Erreur lors de l'exécution.", flags: [MessageFlags.Ephemeral] });
                }
            }
            return;
        }

        // 2. Gestion du Système Staff (Boutons et Modals)
        await staffHandler.handleStaffInteraction(interaction);

        // 3. Gestion du Règlement (Ancien code)
        if (interaction.isButton() && interaction.customId === 'btn_accepter_reglement') {
            const roleId = '1487829925506580721';
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) return;

            try {
                if (interaction.member.roles.cache.has(roleId)) {
                    await interaction.reply({ content: "✅ Déjà accepté !", flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.member.roles.add(roleId);
                    await interaction.reply({ content: "🎉 Règlement accepté !", flags: [MessageFlags.Ephemeral] });

                    const oldEmbed = interaction.message.embeds[0];
                    if (oldEmbed) {
                        let currentCount = 0;
                        const match = (oldEmbed.footer?.text || "").match(/✅ (\d+) personne/);
                        if (match) currentCount = parseInt(match[1], 10);
                        currentCount++;
                        const pluriel = currentCount > 1 ? "s" : "";
                        const newEmbed = EmbedBuilder.from(oldEmbed)
                            .setFooter({ text: `Direction IrisFA | ✅ ${currentCount} personne${pluriel} a${currentCount > 1 ? "v" : ""} accepté` });
                        await interaction.message.edit({ embeds: [newEmbed] }).catch(() => {});
                    }
                }
            } catch (e) { console.error(e); }
        }
    }
};