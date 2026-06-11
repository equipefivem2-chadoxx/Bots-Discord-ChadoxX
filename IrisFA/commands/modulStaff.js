const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modul-staff')
        .setDescription('Affiche ou retire le panneau de recrutement Staff.'),

    async execute(interaction) {
        const authorizedRoles = ['1487829782799450234', '1487829778701484042', '1487829774431682610'];
        if (!interaction.member.roles.cache.some(r => authorizedRoles.includes(r.id))) {
            return interaction.reply({ content: "❌ Accès refusé.", flags: [MessageFlags.Ephemeral] });
        }

        const messages = await interaction.channel.messages.fetch({ limit: 50 });
        const existingPanel = messages.find(m => m.author.id === interaction.client.user.id && m.embeds.some(e => e.title === "✨ RECRUTEMENT STAFF — IRISFA"));

        if (existingPanel) {
            await existingPanel.delete().catch(() => {});
            return interaction.reply({ content: "🗑️ Panneau retiré.", flags: [MessageFlags.Ephemeral] });
        }

        // --- 🧹 RESET DE LA SESSION ---
        // On initialise/vide la liste des postulants pour cette nouvelle session
        interaction.client.staffApplicants = new Set(); 

        const file = new AttachmentBuilder(path.join(__dirname, '../picture/staff.png'));
        const embed = new EmbedBuilder()
            .setTitle("✨ RECRUTEMENT STAFF — IRISFA")
            .setDescription("Vous souhaitez rejoindre nos rangs ?\n\n> **Note :** Une seule candidature par session.\n\n*Cliquez ci-dessous pour postuler.*")
            .setColor('#E1C699')
            .setImage('attachment://staff.png')
            .setFooter({ text: "Direction IrisFA • Recrutement" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_postuler_staff').setLabel('Déposer son dossier').setStyle(ButtonStyle.Secondary).setEmoji('📝')
        );

        await interaction.channel.send({ embeds: [embed], components: [row], files: [file] });
        await interaction.reply({ content: "✅ Recrutement ouvert ! (Session réinitialisée)", flags: [MessageFlags.Ephemeral] });
    }
};