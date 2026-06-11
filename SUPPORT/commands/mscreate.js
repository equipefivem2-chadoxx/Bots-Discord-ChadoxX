const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'mscreate',
    description: 'Créer un message prédéfini personnalisé',
    
    async execute(message, args, client) {
        // On crée un bouton bleu
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_mscreate')
                    .setLabel('➕ Créer un message prédéfini')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.reply({ 
            content: 'Clique sur le bouton ci-dessous pour ouvrir la fenêtre de création :', 
            components: [row] 
        });
    }
};