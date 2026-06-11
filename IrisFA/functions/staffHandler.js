const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async handleStaffInteraction(interaction) {
        const modGuildId = '1488475687563169884'; 
        const categoryId = '1491965122011467867'; 
        const modGuild = interaction.client.guilds.cache.get(modGuildId);
        if (!modGuild) return;

        if (!interaction.client.staffApplicants) interaction.client.staffApplicants = new Set();

        // --- 1. CLIC SUR LE BOUTON (VÉRIFICATION SESSION) ---
        if (interaction.isButton() && interaction.customId === 'btn_postuler_staff') {
            if (interaction.client.staffApplicants.has(interaction.user.id)) {
                return await interaction.reply({ 
                    content: "❌ **Tu as déjà postulé pour cette session.**\nPatiente jusqu'à une réponse ou au prochain recrutement.", 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            const modal = new ModalBuilder().setCustomId('modal_staff_candidature').setTitle('Candidature Staff - IrisFA');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('s_pres')
                        .setLabel('Présentation (Prénom, Âge, Dispos, etc.)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('s_exp')
                        .setLabel('Vos expériences en RP et en modération')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('s_motiv')
                        .setLabel('Motivations & apport pour le serveur')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Détaillez vos motivations et ce que vous pouvez apporter...')
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('s_why')
                        .setLabel('Pourquoi vous ?')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('s_infos')
                        .setLabel('Informations complémentaires')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                )
            );
            return await interaction.showModal(modal);
        }

        // --- 2. RÉCEPTION ET ENVOI DU DOSSIER ---
        if (interaction.isModalSubmit() && interaction.customId === 'modal_staff_candidature') {
            interaction.client.staffApplicants.add(interaction.user.id);

            try {
                const channel = await modGuild.channels.create({
                    name: `📁-candid-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [{ id: modGuild.id, deny: [PermissionFlagsBits.ViewChannel] }],
                });

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `DOSSIER DE CANDIDATURE OFFICIEL`, iconURL: interaction.guild.iconURL() })
                    .setTitle(`📝 DOSSIER : ${interaction.user.tag}`)
                    .setColor('#E1C699')
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '👤 Candidat', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                        { name: '📅 Création', value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`, inline: true },
                        { name: '📥 Arrivée', value: `<t:${Math.floor(interaction.member.joinedTimestamp / 1000)}:R>`, inline: true },
                        { name: '📂 PRÉSENTATION', value: `> ${interaction.fields.getTextInputValue('s_pres')}` },
                        { name: '🛡️ EXPÉRIENCE', value: `> ${interaction.fields.getTextInputValue('s_exp')}` },
                        { name: '💡 MOTIVATIONS & APPORT', value: `> ${interaction.fields.getTextInputValue('s_motiv')}` },
                        { name: '🎯 POURQUOI LUI ?', value: `> ${interaction.fields.getTextInputValue('s_why')}` },
                        { name: '➕ COMPLÉMENTS', value: `\`\`\`${interaction.fields.getTextInputValue('s_infos') || "Aucun"}\`\`\`` }
                    ).setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_staff_accept').setLabel('Accepter').setStyle(ButtonStyle.Success).setEmoji('✅'),
                    new ButtonBuilder().setCustomId('btn_staff_refuse').setLabel('Refuser').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
                );

                await channel.send({ content: "🔔 **Nouveau dossier reçu !**", embeds: [embed], components: [row] });

                await interaction.reply({ 
                    content: "✅ **Candidature bien envoyée.**\nSi tu n'es pas contacté dans les jours à venir, c'est que tu n'as pas été retenu.", 
                    flags: [MessageFlags.Ephemeral] 
                });

            } catch (e) { console.error("Erreur lors de l'envoi du dossier :", e); }
        }

        // --- 3. GESTION DES BOUTONS STAFF (FIX CRASH ICI) ---
        if (interaction.isButton()) {
            if (interaction.customId === 'btn_staff_accept') {
                // On vérifie que le salon existe encore avant de changer le nom
                if (interaction.channel) {
                    await interaction.channel.setName(interaction.channel.name.replace('📁', '✅')).catch(() => {});
                }
                await interaction.update({ components: [] }).catch(() => {});
            }

            if (interaction.customId === 'btn_staff_refuse') {
                await interaction.reply({ content: "🗑️ Dossier refusé. Suppression du salon...", flags: [MessageFlags.Ephemeral] });
                
                // ✨ FIX : On utilise interaction.channel?.delete() pour éviter le crash si channel est null
                setTimeout(() => {
                    if (interaction.channel && interaction.channel.type !== ChannelType.DM) {
                        interaction.channel.delete().catch(() => {
                            console.log("Le salon était déjà supprimé, crash évité.");
                        });
                    }
                }, 3000);
            }
        }
    }
};