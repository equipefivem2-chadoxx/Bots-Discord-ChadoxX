// src/events/repCommand.js

const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const commandName = '!rep';
        const roleRequiredId = '1502295098560352509'; // Ton rôle staff

        if (message.content === commandName) {
            
            // Vérification du rôle
            if (!message.member.roles.cache.has(roleRequiredId)) return;

            // Création du bouton
            const button = new ButtonBuilder()
                .setCustomId('btn_open_rep_modal')
                .setLabel('Ouvrir la fenêtre de réponse')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('💬');

            const row = new ActionRowBuilder().addComponents(button);

            // Envoi du bouton et suppression de ton message "!rep"
            await message.reply({ 
                content: "Clique ici pour configurer ta réponse :", 
                components: [row] 
            });
            message.delete().catch(() => {});
        }
    },
};