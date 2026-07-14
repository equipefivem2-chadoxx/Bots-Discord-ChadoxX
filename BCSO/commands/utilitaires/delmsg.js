const { SlashCommandBuilder } = require('discord.js');

const AUTHORIZED_ID = '1247264549489610897';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delmsg')
        .setDescription('Supprime un message silencieusement via son ID.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription("L'ID du message à supprimer")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où se trouve le message (salon actuel par défaut)')
                .setRequired(false)
        ),
        
    async execute(interaction, client) {
        // 1. Restriction stricte à ton ID
        if (interaction.user.id !== AUTHORIZED_ID) {
            return interaction.reply({ 
                content: "❌ Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        // 2. Récupération des paramètres
        const messageId = interaction.options.getString('id');
        const targetChannel = interaction.options.getChannel('salon') || interaction.channel;

        try {
            // 3. Recherche et suppression du message ciblé
            const targetMessage = await targetChannel.messages.fetch(messageId);
            await targetMessage.delete();

            // 4. Confirmation 100% silencieuse
            await interaction.reply({
                content: `🗑️ Le message \`${messageId}\` a été supprimé avec succès dans ${targetChannel}.`,
                ephemeral: true
            });

        } catch (error) {
            console.error("❌ Erreur lors de la suppression du message :", error);
            await interaction.reply({
                content: `⚠️ Impossible de trouver ou supprimer le message \`${messageId}\` dans ${targetChannel}. Vérifie l'ID et mes permissions Discord.`,
                ephemeral: true
            });
        }
    }
};