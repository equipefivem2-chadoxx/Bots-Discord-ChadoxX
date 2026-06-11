const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        
        if (interaction.isStringSelectMenu() && interaction.customId === 'menu_recrutement_irs') {
            const modal = new ModalBuilder()
                .setCustomId('modal_submit_irs')
                .setTitle('Recrutement : Internal Revenue Service');

            const field1 = new TextInputBuilder()
                .setCustomId('irs_nom')
                .setLabel("Identité civile (Nom & Prénom)")
                .setPlaceholder("Renseignez votre identité complète.")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const field2 = new TextInputBuilder()
                .setCustomId('irs_contact')
                .setLabel("Date de naissance & Contact")
                .setPlaceholder("JJ/MM/AAAA — Coordonnées téléphoniques")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const field3 = new TextInputBuilder()
                .setCustomId('irs_parcours')
                .setLabel("Parcours professionnel")
                .setPlaceholder("Détaillez vos anciennes fonctions ou déposez votre CV.")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const field4 = new TextInputBuilder()
                .setCustomId('irs_profil')
                .setLabel("Profil du candidat")
                .setPlaceholder("Décrivez votre tempérament et vos points forts.")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const field5 = new TextInputBuilder()
                .setCustomId('irs_motivs')
                .setLabel("Motivations & Emploi du temps")
                .setPlaceholder("Pourquoi l'IRS ? Précisez vos disponibilités.")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(field1),
                new ActionRowBuilder().addComponents(field2),
                new ActionRowBuilder().addComponents(field3),
                new ActionRowBuilder().addComponents(field4),
                new ActionRowBuilder().addComponents(field5)
            );

            // 1. On affiche la modale
            await interaction.showModal(modal);

            // 2. ✨ LE HACK : On attend 1s et on reset le menu visuellement
            // Même si l'utilisateur annule, le menu redeviendra normal tout seul.
            setTimeout(async () => {
                await interaction.message.edit({ components: interaction.message.components }).catch(() => null);
            }, 1000);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_submit_irs') {
            const data = {
                nom: interaction.fields.getTextInputValue('irs_nom'),
                contact: interaction.fields.getTextInputValue('irs_contact'),
                parcours: interaction.fields.getTextInputValue('irs_parcours'),
                profil: interaction.fields.getTextInputValue('irs_profil'),
                motivs: interaction.fields.getTextInputValue('irs_motivs')
            };

            const logChannelId = '1487838083754758184';
            const logChannel = await client.channels.fetch(logChannelId).catch(() => null);

            if (!logChannel) return;

            const embedCandid = new EmbedBuilder()
                .setColor('#1B5E20')
                .setTitle('💰 NOUVELLE CANDIDATURE : IRS')
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Candidat', value: `${interaction.user} (${interaction.user.id})`, inline: true },
                    { name: '🆔 Identité RP', value: data.nom, inline: true },
                    { name: '📞 Contact / Naissance', value: data.contact, inline: false },
                    { name: '💼 Parcours Pro', value: data.parcours },
                    { name: '👤 Profil & Points forts', value: data.profil },
                    { name: '📈 Motivations & Dispos', value: data.motivs }
                )
                .setTimestamp();

            const messageLog = await logChannel.send({ embeds: [embedCandid] });
            await messageLog.startThread({ name: `Dossier IRS - ${data.nom}`, autoArchiveDuration: 1440 });

            await interaction.reply({ 
                content: "✅ Votre dossier a été déposé avec succès.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    },
};