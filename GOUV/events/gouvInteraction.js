const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        
        // --- PARTIE 1 : AFFICHAGE DU FORMULAIRE GOUVERNEMENTAL ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'menu_recrutement_gouv') {
            const selectedRole = interaction.values[0];
            
            const roleLabels = {
                'gouv_admin': 'Administration Publique',
                'gouv_civil': 'Services Civils / Sociaux',
                'gouv_com': 'Communication & Événementiel',
                'gouv_securite': 'Sécurité Institutionnelle'
            };

            const modal = new ModalBuilder()
                .setCustomId(`modal_submit_gouv_${selectedRole}`)
                .setTitle(`Dossier : ${roleLabels[selectedRole] || "Gouvernement"}`);

            // 📝 Champ 1 : Identité
            const field1 = new TextInputBuilder()
                .setCustomId('gouv_nom')
                .setLabel("Identité du Citoyen (Nom & Prénom)")
                .setPlaceholder("Inscrivez votre identité complète (Nom et Prénom RP).")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // 📞 Champ 2 : Registre Civil
            const field2 = new TextInputBuilder()
                .setCustomId('gouv_contact')
                .setLabel("Registre Civil & Contact")
                .setPlaceholder("JJ/MM/AAAA — Numéro de liaison téléphonique.")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // 🚻 Champ 3 : Mention de Genre
            const field3 = new TextInputBuilder()
                .setCustomId('gouv_genre')
                .setLabel("Mention de Genre (F / H)")
                .setPlaceholder("Précisez votre genre civil.")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // 📜 Champ 4 : Biographie
            const field4 = new TextInputBuilder()
                .setCustomId('gouv_bio')
                .setLabel("Synthèse Biographique")
                .setPlaceholder("Décrivez votre parcours de vie et votre situation actuelle en quelques lignes.")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // 📈 Champ 5 : Objectifs
            const field5 = new TextInputBuilder()
                .setCustomId('gouv_objectifs')
                .setLabel("Motivations & Assiduité")
                .setPlaceholder("Pourquoi intégrer la Vie Civile ? Précisez vos horaires de présence.")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(field1),
                new ActionRowBuilder().addComponents(field2),
                new ActionRowBuilder().addComponents(field3),
                new ActionRowBuilder().addComponents(field4),
                new ActionRowBuilder().addComponents(field5)
            );

            await interaction.showModal(modal);

            // ✨ Reset auto du sélecteur après 1s
            setTimeout(async () => {
                await interaction.message.edit({ components: interaction.message.components }).catch(() => null);
            }, 1000);
        }

        // --- PARTIE 2 : RÉCEPTION ET ENVOI ---
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_submit_gouv_')) {
            
            const roleKey = interaction.customId.replace('modal_submit_gouv_', '');
            const roleLabels = {
                'gouv_admin': 'Administration',
                'gouv_civil': 'Services Civils',
                'gouv_com': 'Communication',
                'gouv_securite': 'Sécurité'
            };

            const data = {
                nom: interaction.fields.getTextInputValue('gouv_nom'),
                contact: interaction.fields.getTextInputValue('gouv_contact'),
                genre: interaction.fields.getTextInputValue('gouv_genre'),
                bio: interaction.fields.getTextInputValue('gouv_bio'),
                objectifs: interaction.fields.getTextInputValue('gouv_objectifs')
            };

            const logChannelId = '1487838172040790167';
            const logChannel = await client.channels.fetch(logChannelId).catch(() => null);

            if (!logChannel) return;

            const embedLog = new EmbedBuilder()
                .setColor('#002366')
                .setTitle(`🏛️ NOUVEAU DOSSIER : ${roleLabels[roleKey]?.toUpperCase() || "GOUVERNEMENT"}`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Citoyen', value: `${interaction.user}`, inline: true },
                    { name: '🚻 Genre', value: data.genre, inline: true },
                    { name: '🆔 Identité', value: data.nom, inline: false },
                    { name: '📞 Registre / Contact', value: data.contact, inline: false },
                    { name: '📜 Biographie', value: data.bio },
                    { name: '📈 Objectifs & Assiduité', value: data.objectifs }
                )
                .setTimestamp()
                .setFooter({ text: 'Secrétariat d’État • San Andreas' });

            const messageLog = await logChannel.send({ embeds: [embedLog] });
            
            await messageLog.startThread({
                name: `Gouv - ${data.nom}`,
                autoArchiveDuration: 1440,
            });

            await interaction.reply({ 
                content: "🏛️ Votre demande a été enregistrée. Le Cabinet du Gouverneur traitera votre dossier dans les plus brefs délais.", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    },
};