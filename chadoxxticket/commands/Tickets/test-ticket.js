const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-ticket')
        .setDescription('Vérifie que le module ticket répond bien'),
    async execute(interaction, client) {
        await interaction.reply({ 
            content: '🎟️ Le bot ChadoxXTICKET est opérationnel ! Prêt à créer des tickets.', 
            ephemeral: true 
        });
    },
};