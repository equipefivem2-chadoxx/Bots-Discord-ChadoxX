const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime un nombre défini de messages dans le salon actuel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => 
            option.setName('nombre')
                .setDescription('Le nombre de messages à supprimer (entre 1 et 100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),

    async execute(interaction) {
        const amount = interaction.options.getInteger('nombre');

        try {
            // Bulk delete supprime les messages. 'true' permet d'ignorer les messages de plus de 14 jours (limite de Discord)
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);
            
            await interaction.reply({ 
                content: `🧹 **${deletedMessages.size}** messages ont été supprimés avec succès par <@${interaction.user.id}> !`, 
                ephemeral: true // Le message de confirmation ne sera visible que par le staff qui a tapé la commande
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ Une erreur s'est produite. Discord m'empêche peut-être de supprimer des messages datant de plus de 14 jours.", 
                ephemeral: true 
            });
        }
    }
};