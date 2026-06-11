const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        
        if (interaction.isStringSelectMenu() && interaction.customId === 'menu_recrutement_dsu') {
            const modal = new ModalBuilder()
                .setCustomId('modal_submit_dsu')
                .setTitle('Recrutement : Diplomatic Security Unit');

            const field1 = new TextInputBuilder()
                .setCustomId('dsu_nom')
                .setLabel("Identité administrative (Nom - Prénom)")
                .setPlaceholder("Renseignez votre nom et prénom complet.")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const field2 = new TextInputBuilder()
                .setCustomId('dsu_contact')
                .setLabel("Date de naissance & Coordonnées")
                .setPlaceholder("JJ/MM/AAAA — Numéro de téléphone")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const field3 = new TextInputBuilder()
                .setCustomId('dsu_motivs')
                .setLabel("Cursus & Intentions")
                .setPlaceholder("Parcours, expériences et pourquoi le DSU.")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const field4 = new TextInputBuilder()
                .setCustomId('dsu_hrp_age')
                .setLabel("Section Hors-RP ╎ Âge réel")
                .setPlaceholder("Indiquez votre âge réel.")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const field5 = new TextInputBuilder()
                .setCustomId('dsu_hrp_lore')
                .setLabel("Dossier Technique (HRP)")
                .setPlaceholder("Horaires de présence et court résumé du lore du personnage.")
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

            // 2. ✨ LE HACK : Reset auto du menu après 1s
            setTimeout(async () => {
                await interaction.message.edit({ components: interaction.message.components }).catch(() => null);
            }, 1000);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_submit_dsu') {
            const data = {
                nom: interaction.fields.getTextInputValue('dsu_nom'),
                contact: interaction.fields.getTextInputValue('dsu_contact'),
                motivs: interaction.fields.getTextInputValue('dsu_motivs'),
                ageHRP: interaction.fields.getTextInputValue('dsu_hrp_age'),
                loreHRP: interaction.fields.getTextInputValue('dsu_hrp_lore')
            };

            const logChannelId = '1487838340462936165';
            const logChannel = await client.channels.fetch(logChannelId).catch(() => null);

            if (!logChannel) return;

            const embedCandid = new EmbedBuilder()
                .setColor('#1A1A1B')
                .setTitle('🛡️ NOUVELLE CANDIDATURE : D.S.U')
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '🆔 Identité IC', value: data.nom, inline: true },
                    { name: '👤 Âge Réel (HRP)', value: data.ageHRP, inline: true },
                    { name: '📂 Cursus & Intentions', value: data.motivs },
                    { name: '⌛ Dossier Technique (HRP)', value: data.loreHRP }
                )
                .setTimestamp();

            const messageLog = await logChannel.send({ embeds: [embedCandid] });
            await messageLog.startThread({ name: `Dossier DSU - ${data.nom}`, autoArchiveDuration: 1440 });

            await interaction.reply({ 
                content: "✅ Dossier DSU transmis avec succès.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    },
};