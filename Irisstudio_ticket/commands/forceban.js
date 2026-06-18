const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forceban')
        .setDescription('Bannit préventivement un utilisateur via son ID (même hors du serveur).')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option => 
            option.setName('id')
                .setDescription('L\'ID (suite de chiffres) du compte à bloquer')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison de ce bannissement préventif')
                .setRequired(false)
        ),

    async execute(interaction) {
        const userId = interaction.options.getString('id');
        const reason = interaction.options.getString('raison') || 'Bannissement préventif (Forceban)';

        // Petite sécurité : on vérifie que l'ID ressemble bien à un ID Discord (uniquement des chiffres)
        if (!/^\d{17,19}$/.test(userId)) {
            return interaction.reply({ 
                content: "❌ L'ID fourni n'est pas valide. Un ID Discord ressemble à ceci : `123456789012345678`.", 
                ephemeral: true 
            });
        }

        // On fait patienter l'interaction car on va interroger l'API globale de Discord
        await interaction.deferReply(); 

        try {
            // Le bot va chercher les infos du compte directement dans la base de données de Discord
            const user = await interaction.client.users.fetch(userId);

            // Le vrai ban par ID (fonctionne même si la personne n'a jamais rejoint)
            await interaction.guild.members.ban(userId, { reason: reason });
            
            const forcebanEmbed = new EmbedBuilder()
                .setColor('#8b0000') // Un rouge très sombre pour marquer le coup
                .setTitle('🛡️ Bannissement Préventif (Forceban)')
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'Compte Bloqué', value: `${user.username} (<@${user.id}>)`, inline: true },
                    { name: 'ID Discord', value: `\`${user.id}\``, inline: true },
                    { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: false },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setFooter({ text: "Sécurité : Ce compte ne pourra jamais rejoindre le serveur." })
                .setTimestamp();

            await interaction.editReply({ embeds: [forcebanEmbed] });
        } catch (error) {
            console.error(error);
            // Si le compte a été supprimé par Discord ou que l'ID n'existe pas du tout
            await interaction.editReply({ content: "❌ Impossible de bloquer ce compte. Vérifie que l'ID est correct et correspond bien à un utilisateur Discord existant." });
        }
    }
};