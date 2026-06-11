const { 
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, 
    EmbedBuilder, MessageFlags, ChannelType, PermissionFlagsBits, 
    ButtonBuilder, ButtonStyle, AttachmentBuilder 
} = require('discord.js');
const path = require('path');

module.exports = {
    async handleRDVInteraction(interaction) {
        const logoPath = path.join(__dirname, '../picture/logo.png');

        // --- 1. OUVERTURE DU FORMULAIRE ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'menu_rdv_samc') {
            const choix = interaction.values[0];
            const modal = new ModalBuilder().setCustomId(`modal_rdv_${choix}`).setTitle(`Prise de RDV`);

            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rdv_nom').setLabel('Nom & Prénom RP').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rdv_age').setLabel('Votre âge').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rdv_tel').setLabel('Numéro de téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rdv_dispo').setLabel('Vos disponibilités').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rdv_raison').setLabel(`Motif du RDV`).setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
            return await interaction.showModal(modal);
        }

        // --- 2. TRAITEMENT DU FORMULAIRE ---
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_rdv_')) {
            const choix = interaction.customId.replace('modal_rdv_', '');
            const nom = interaction.fields.getTextInputValue('rdv_nom');
            const age = interaction.fields.getTextInputValue('rdv_age');
            const tel = interaction.fields.getTextInputValue('rdv_tel');
            const dispo = interaction.fields.getTextInputValue('rdv_dispo');
            const raison = interaction.fields.getTextInputValue('rdv_raison');

            let categoryId, titleEmbed, emoji, rolePing, logChannelId;

            if (choix === 'psy') { categoryId = '1489769030519750797'; titleEmbed = 'Psychologue'; emoji = '🫂'; rolePing = '1489630183441957005'; logChannelId = '1489775368876462080'; }
            else if (choix === 'morgue') { categoryId = '1489769092524281968'; titleEmbed = 'Morgue'; emoji = '⚰️'; rolePing = '1489632898687701164'; logChannelId = '1489775415785423040'; }
            else if (choix === 'gyneco') { categoryId = '1489769111138603148'; titleEmbed = 'Gynécologue'; emoji = '🌸'; rolePing = '1489630270255661159'; logChannelId = '1489775438627864699'; }
            else if (choix === 'analyses') { categoryId = '1489769134727237823'; titleEmbed = 'Analyses Médicales'; emoji = '💉'; rolePing = '1489631207619825966'; logChannelId = '1489775451470561430'; }
            else if (choix === 'direction') { categoryId = '1489769162489331782'; titleEmbed = 'Direction'; emoji = '💊'; rolePing = '1487833910082539582'; logChannelId = '1489775399222382613'; }

            try {
                const newChannel = await interaction.guild.channels.create({
                    name: `rdv-${nom.toLowerCase().replace(/\s+/g, '-')}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    topic: interaction.user.id, // On garde l'ID de l'utilisateur en topic au cas où
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                        // Rôle spécifique du service (ex: Psy)
                        { id: rolePing, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                        // ✨ AJOUT : Le rôle SAMC général qui doit tout voir
                        { id: '1487833884988276756', allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                    ]
                });

                await interaction.reply({ 
                    content: `✅ **Votre demande de rendez-vous a bien été transmise !**\nUn membre de notre équipe en a été notifié et prendra contact avec vous prochainement par téléphone.`, 
                    flags: MessageFlags.Ephemeral 
                });

                const embedRDV = new EmbedBuilder()
                    .setTitle(`${emoji} Demande de RDV - ${titleEmbed}`)
                    .setColor('#8a0303')
                    .setThumbnail('attachment://logo.png')
                    .addFields(
                        { name: '👤 Patient Discord', value: `<@${interaction.user.id}>`, inline: false },
                        { name: '📝 Nom RP', value: nom, inline: true },
                        { name: '🎂 Âge', value: age, inline: true },
                        { name: '📞 Téléphone', value: tel, inline: true },
                        { name: '📅 Disponibilités', value: dispo, inline: false },
                        { name: '❓ Motif', value: raison, inline: false }
                    ).setTimestamp();

                const btnClose = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`close_rdv_${choix}`).setLabel('Clôturer le RDV').setStyle(ButtonStyle.Danger).setEmoji('🔒')
                );

                await newChannel.send({ 
                    content: `🔔 <@&${rolePing}>, nouveau rendez-vous !`,
                    embeds: [embedRDV], 
                    components: [btnClose],
                    files: [new AttachmentBuilder(logoPath)] 
                });

                const logChan = interaction.guild.channels.cache.get(logChannelId);
                if (logChan) {
                    const embedLog = EmbedBuilder.from(embedRDV).setTitle(`📁 [OUVERTURE] RDV ${titleEmbed}`).setColor('#2ecc71');
                    await logChan.send({ embeds: [embedLog] });
                }

            } catch (error) {
                console.error(error);
            }
        }

        // --- 3. CLÔTURE DU SALON ---
        if (interaction.isButton() && interaction.customId.startsWith('close_rdv_')) {
            const choix = interaction.customId.replace('close_rdv_', '');
            let logChannelId;
            if (choix === 'psy') logChannelId = '1489775368876462080';
            else if (choix === 'direction') logChannelId = '1489775399222382613';
            else if (choix === 'morgue') logChannelId = '1489775415785423040';
            else if (choix === 'gyneco') logChannelId = '1489775438627864699';
            else if (choix === 'analyses') logChannelId = '1489775451470561430';

            const logChan = interaction.guild.channels.cache.get(logChannelId);
            const originalEmbed = interaction.message.embeds[0];

            if (logChan) {
                const embedFinish = EmbedBuilder.from(originalEmbed)
                    .setTitle(`🔒 [CLÔTURÉ] RDV ${choix.toUpperCase()}`)
                    .setColor('#8a0303')
                    .addFields({ name: '🔐 Fermé par', value: `<@${interaction.user.id}>`, inline: false })
                    .setTimestamp();
                
                await logChan.send({ embeds: [embedFinish] });
            }

            await interaction.reply({ content: "Fermeture du salon dans 5 secondes..." });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    }
};