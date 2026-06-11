const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        
        // --- DETECTION DU CLIC SUR LE MENU ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'menu_recrutement_justice') {
            const selectedRole = interaction.values[0];
            
            const roleLabels = {
                'justice_procureur': 'Bureau du Procureur',
                'justice_juge': 'Magistrature (Juge)',
                'justice_avocat': 'Barreau (Avocat)',
                'justice_greffier': 'Greffe / Assistant'
            };

            // Sécurité : Si le label n'existe pas, on met un titre générique
            const titleLabel = roleLabels[selectedRole] || "Candidature Justice";

            const modal = new ModalBuilder()
                .setCustomId(`modal_submit_justice_${selectedRole}`)
                .setTitle(`Dossier : ${titleLabel}`);

            const field1 = new TextInputBuilder()
                .setCustomId('just_nom')
                .setLabel("Identité du postulant (Nom & Prénom)")
                .setPlaceholder("Identité complète enregistrée à la mairie.")
                .setStyle(TextInputStyle.Short).setRequired(true);

            const field2 = new TextInputBuilder()
                .setCustomId('just_contact')
                .setLabel("Coordonnées & Date de naissance")
                .setPlaceholder("JJ/MM/AAAA — Numéro de liaison.")
                .setStyle(TextInputStyle.Short).setRequired(true);

            const field3 = new TextInputBuilder()
                .setCustomId('just_cv')
                .setLabel("Parcours & Expériences passées")
                .setPlaceholder("Détaillez vos anciens mandats ou postes occupés.")
                .setStyle(TextInputStyle.Paragraph).setRequired(true);

            const field4 = new TextInputBuilder()
                .setCustomId('just_profil')
                .setLabel("Présentation du citoyen")
                .setPlaceholder("Votre personnage, ses ambitions et sa vision.")
                .setStyle(TextInputStyle.Paragraph).setRequired(true);

            const field5 = new TextInputBuilder()
                .setCustomId('just_motivs')
                .setLabel("Motivations & Disponibilités")
                .setPlaceholder("Pourquoi servir la Justice ? Vos disponibilités.")
                .setStyle(TextInputStyle.Paragraph).setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(field1),
                new ActionRowBuilder().addComponents(field2),
                new ActionRowBuilder().addComponents(field3),
                new ActionRowBuilder().addComponents(field4),
                new ActionRowBuilder().addComponents(field5)
            );

            await interaction.showModal(modal);

            // Reset auto du menu pour qu'il ne reste pas "bloqué"
            setTimeout(async () => {
                await interaction.message.edit({ components: interaction.message.components }).catch(() => null);
            }, 1000);
            return;
        }

        // --- ENVOI DU FORMULAIRE ---
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_submit_justice_')) {
            const roleId = interaction.customId.replace('modal_submit_justice_', '');
            
            const roleLabels = {
                'justice_procureur': 'Procureur',
                'justice_juge': 'Juge',
                'justice_avocat': 'Avocat',
                'justice_greffier': 'Greffier'
            };

            const logChannelId = '1487838196984184863';
            const logChannel = await client.channels.fetch(logChannelId).catch(() => null);

            if (!logChannel) return;

            const embedCandid = new EmbedBuilder()
                .setColor('#C5A059')
                .setTitle(`⚖️ DOSSIER : ${ (roleLabels[roleId] || roleId).toUpperCase() }`)
                .addFields(
                    { name: '👤 Postulant', value: `${interaction.user}`, inline: true },
                    { name: '🆔 Identité RP', value: interaction.fields.getTextInputValue('just_nom'), inline: true },
                    { name: '📞 Contact', value: interaction.fields.getTextInputValue('just_contact') },
                    { name: '📜 CV', value: interaction.fields.getTextInputValue('just_cv') },
                    { name: '🖋️ Profil', value: interaction.fields.getTextInputValue('just_profil') },
                    { name: '⚖️ Motivations', value: interaction.fields.getTextInputValue('just_motivs') }
                )
                .setTimestamp();

            const msgLog = await logChannel.send({ embeds: [embedCandid] });
            await msgLog.startThread({ name: `Dossier Justice - ${interaction.fields.getTextInputValue('just_nom')}` });

            // Mise à jour de la réponse avec ta phrase préférée
            await interaction.reply({ 
                content: "⚖️ Dossier inscrit au registre. Un membre de la magistrature examinera votre demande.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    },
};