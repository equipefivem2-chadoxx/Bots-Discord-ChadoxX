const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
// Imports modulaires
const rdvHandler = require('../functions/rdvHandler.js');
const trackerCandidature = require('../functions/trackerCandidature.js'); // NOUVEAU MODULE

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        
        // On redirige d'abord vers le module de rendez-vous
        await rdvHandler.handleRDVInteraction(interaction);

        // ==========================================
        // 1. CLIC SUR "CANDIDATER"
        // ==========================================
        if (interaction.isButton() && interaction.customId === 'btn_candidater') {
            
            // 🚫 VÉRIFICATION BLACKLIST
            const roleBlId = '1490176640058130452';
            if (interaction.member.roles.cache.has(roleBlId)) {
                return interaction.reply({
                    content: "🚫 **Accès Refusé**\nL'État-Major du SAMC a placé votre profil sur liste noire. Vous n'êtes plus autorisé à soumettre de candidature pour rejoindre nos effectifs.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const modal = new ModalBuilder().setCustomId('modal_candidature_samc').setTitle('Candidature SAMC');
            
            const inputIdentite = new TextInputBuilder().setCustomId('identite').setLabel('Nom & Prénom RP').setStyle(TextInputStyle.Short).setRequired(true);
            const inputInfos = new TextInputBuilder().setCustomId('infos').setLabel('Date de naissance & Numéro de tel').setStyle(TextInputStyle.Short).setRequired(true);
            const inputDispo = new TextInputBuilder().setCustomId('dispos').setLabel('Vos disponibilités').setStyle(TextInputStyle.Paragraph).setRequired(true);
            const inputMotivations = new TextInputBuilder().setCustomId('motivations').setLabel('Pourquoi le SAMC & Motivations ?').setStyle(TextInputStyle.Paragraph).setRequired(true);
            const inputQualitesDefauts = new TextInputBuilder().setCustomId('qualites_defauts').setLabel('3 Qualités & 3 Défauts').setStyle(TextInputStyle.Paragraph).setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputIdentite),
                new ActionRowBuilder().addComponents(inputInfos),
                new ActionRowBuilder().addComponents(inputDispo),
                new ActionRowBuilder().addComponents(inputMotivations),
                new ActionRowBuilder().addComponents(inputQualitesDefauts)
            );
            await interaction.showModal(modal);
        }

        // ==========================================
        // 2. ENVOI DU FORMULAIRE
        // ==========================================
        if (interaction.isModalSubmit() && interaction.customId === 'modal_candidature_samc') {
            const identite = interaction.fields.getTextInputValue('identite');
            const infos = interaction.fields.getTextInputValue('infos');
            const dispos = interaction.fields.getTextInputValue('dispos');
            const motivations = interaction.fields.getTextInputValue('motivations');
            const qualitesDefauts = interaction.fields.getTextInputValue('qualites_defauts');

            // 🚨 APPEL DU MODULE ANTI-SPAM CANDIDATURE
            await trackerCandidature.verifierSpamCandidature(interaction, identite);

            await interaction.reply({
                content: "✅ **Votre candidature a bien été envoyée !**\n*Si vous n'avez pas de réponse, veuillez considérer que votre candidature n'a pas été retenue.*",
                flags: MessageFlags.Ephemeral
            });

            const embedCandidature = new EmbedBuilder()
                .setTitle(`📄 Nouvelle candidature - ${identite}`)
                .setColor('#8a0303')
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: '👤 Utilisateur Discord', value: `<@${interaction.user.id}>`, inline: false },
                    { name: '📝 Identité RP', value: identite, inline: true },
                    { name: '📞 Naissance & Tel', value: infos, inline: true },
                    { name: '📅 Disponibilités', value: dispos, inline: false },
                    { name: '🎯 Motivations', value: motivations, inline: false },
                    { name: '⚖️ Qualités & Défauts', value: qualitesDefauts, inline: false }
                )
                .setTimestamp();

            const btnAccepter = new ButtonBuilder().setCustomId('btn_accepter_candid').setLabel('Accepter').setEmoji('✅').setStyle(ButtonStyle.Success);
            const btnRefuser = new ButtonBuilder().setCustomId('btn_refuser_candid').setLabel('Refuser').setEmoji('❌').setStyle(ButtonStyle.Danger);
            const rowButtons = new ActionRowBuilder().addComponents(btnAccepter, btnRefuser);

            const salonCandidatureId = '1489761273498439801';
            const salonCandidature = interaction.guild.channels.cache.get(salonCandidatureId);
            if (salonCandidature) await salonCandidature.send({ embeds: [embedCandidature], components: [rowButtons] });

            const salonLogsCandidId = '1489762274997571674';
            const salonLogs = interaction.guild.channels.cache.get(salonLogsCandidId);
            if (salonLogs) await salonLogs.send({ embeds: [embedCandidature] });
        }

        // --- FONCTION DE RÉCAPITULATIF ---
        async function updateRecapFileAttente(channel, botId) {
            if (!channel) return;
            const msgs = await channel.messages.fetch({ limit: 50 });
            const count = msgs.filter(m => m.components.some(row => row.components.some(btn => btn.customId === 'btn_contacted'))).size;
            
            const oldRecap = msgs.find(m => m.author.id === botId && m.content.includes('RÉCAPITULATIF DES CONTACTS'));
            if (oldRecap) await oldRecap.delete().catch(()=>{});

            const texteRecap = `📊 **RÉCAPITULATIF DES CONTACTS**\nIl reste actuellement **${count}** candidat(s) à contacter dans la file d'attente.`;
            await channel.send({ content: texteRecap });
        }

        // ==========================================
        // 3. CLIC SUR "ACCEPTER" ou "REFUSER"
        // ==========================================
        if (interaction.isButton() && (interaction.customId === 'btn_accepter_candid' || interaction.customId === 'btn_refuser_candid')) {
            const roleRecruteurId = '1487833914268455105';
            if (!interaction.member.roles.cache.has(roleRecruteurId)) {
                return interaction.reply({ content: "❌ Vous n'avez pas l'autorisation de gérer les candidatures.", flags: MessageFlags.Ephemeral });
            }

            const originalEmbed = interaction.message.embeds[0];
            const userPing = originalEmbed.fields[0].value;
            const identite = originalEmbed.fields[1].value;
            const tel = originalEmbed.fields[2].value;
            
            const userId = userPing.replace(/[<@!>]/g, '');

            // -------- SI REFUS --------
            if (interaction.customId === 'btn_refuser_candid') {
                await interaction.reply({ content: `✅ Vous avez refusé la candidature de ${identite}.`, flags: MessageFlags.Ephemeral });
                
                try {
                    const memberToDM = await client.users.fetch(userId);
                    await memberToDM.send({
                        content: `Bonjour/Bonsoir,\n\nMalheureusement, votre candidature pour rejoindre le **San Andreas Medical Center** n'a pas été retenue.\nVous pourrez toutefois retenter votre chance avec un délai minimum de **2 semaines**.\n\nMerci pour votre implication et l'intérêt que vous portez au SAMC.`
                    });
                } catch (error) {
                    console.log(`[SAMC] Impossible d'envoyer un MP à l'utilisateur ${userId} (MP fermés).`);
                }

                const logRefusId = '1489762667563585556';
                const channelRefus = interaction.guild.channels.cache.get(logRefusId);
                
                const embedRefus = new EmbedBuilder()
                    .setTitle('❌ Décision : Candidature Refusée')
                    .setDescription(`La candidature de **${identite}** n'a pas été retenue par nos services.`)
                    .setColor('#e74c3c') 
                    .addFields(
                        { name: '👤 Utilisateur', value: userPing, inline: true },
                        { name: '📝 Identité RP', value: identite, inline: true },
                        { name: '👮 Traitée par', value: `<@${interaction.user.id}>`, inline: false }
                    )
                    .setFooter({ text: 'Service de Recrutement SAMC' })
                    .setTimestamp();
                
                if (channelRefus) await channelRefus.send({ embeds: [embedRefus] });
                await interaction.message.delete().catch(()=>{});
            } 
            
            // -------- SI ACCEPTÉ --------
            else if (interaction.customId === 'btn_accepter_candid') {
                await interaction.reply({ content: `✅ Candidature acceptée ! Le candidat a été ajouté à la file d'attente.`, flags: MessageFlags.Ephemeral });

                const logAccepteId = '1489763989914124419';
                const channelAccepte = interaction.guild.channels.cache.get(logAccepteId);
                let urlCandidature = "Lien indisponible";

                const embedAccepte = EmbedBuilder.from(originalEmbed)
                    .setTitle(`✅ Nouvelle candidature - ${identite} [ACCEPTÉ]`)
                    .setColor('#2ecc71')
                    .addFields(
                        { name: '👮 Acceptée par', value: `<@${interaction.user.id}>`, inline: false }
                    );

                if (channelAccepte) {
                    const msgAccepte = await channelAccepte.send({ embeds: [embedAccepte] });
                    urlCandidature = msgAccepte.url;
                }

                const fileAttenteId = '1489762348192235521';
                const channelAttente = interaction.guild.channels.cache.get(fileAttenteId);

                const embedAttente = new EmbedBuilder()
                    .setTitle(`📞 Candidat à contacter : ${identite}`)
                    .setColor('#e67e22') 
                    .setDescription(`Veuillez contacter ce citoyen pour la suite de son recrutement.`)
                    .addFields(
                        { name: '📝 Nom & Prénom', value: identite, inline: true },
                        { name: '👤 Discord', value: userPing, inline: true },
                        { name: '📱 Téléphone & Infos', value: tel, inline: true },
                        { name: '🔗 Dossier complet', value: `[Cliquez ici pour relire sa candidature](${urlCandidature})`, inline: false }
                    )
                    .setTimestamp();
                
                const btnContacted = new ButtonBuilder().setCustomId('btn_contacted').setLabel('A été contacté').setEmoji('📞').setStyle(ButtonStyle.Success);
                const row = new ActionRowBuilder().addComponents(btnContacted);

                if (channelAttente) {
                    await channelAttente.send({ embeds: [embedAttente], components: [row] });
                    await updateRecapFileAttente(channelAttente, client.user.id);
                }
                
                await interaction.message.delete().catch(()=>{}); 
            }
        }

        // ==========================================
        // 4. CLIC SUR LE BOUTON "A ÉTÉ CONTACTÉ"
        // ==========================================
        if (interaction.isButton() && interaction.customId === 'btn_contacted') {
            const roleRecruteurId = '1487833914268455105';
            if (!interaction.member.roles.cache.has(roleRecruteurId)) {
                return interaction.reply({ content: "❌ Seul un recruteur peut marquer un candidat comme contacté.", flags: MessageFlags.Ephemeral });
            }

            await interaction.reply({ content: '✅ Le candidat a été retiré de la file d\'attente.', flags: MessageFlags.Ephemeral });
            await interaction.message.delete().catch(()=>{}); 
            await updateRecapFileAttente(interaction.channel, client.user.id); 
        }
    }
};