const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        
        // ==========================================
        // 1️⃣ GESTION DES CLICS SUR LES BOUTONS
        // ==========================================
        if (interaction.isButton()) {
            
            // 🟢 BOUTON OUVRIR
            if (interaction.customId === 'btn_recrutement_ouvert') {
                const modal = new ModalBuilder().setCustomId('modal_ouvert').setTitle('Ouvrir les recrutements');
                
                const inputDates = new TextInputBuilder()
                    .setCustomId('input_dates')
                    .setLabel("Dates (ex: du 16 au 19 Avril 2026)")
                    .setStyle(TextInputStyle.Short).setRequired(true);

                const inputSecteur = new TextInputBuilder()
                    .setCustomId('input_secteur')
                    .setLabel("Secteur (NORD, SUD, ou LES DEUX)")
                    .setStyle(TextInputStyle.Short).setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(inputDates), new ActionRowBuilder().addComponents(inputSecteur));
                await interaction.showModal(modal);
            }
            
            // 🔴 BOUTON FERMER
            else if (interaction.customId === 'btn_recrutement_ferme') {
                const salonCibleId = '1487835953824530463';
                const salonCible = interaction.guild.channels.cache.get(salonCibleId);
                if (!salonCible) return interaction.reply({ content: "❌ Salon cible introuvable.", ephemeral: true });

                const logoPath = path.join(__dirname, '..', 'logo.png');
                const logoFile = new AttachmentBuilder(logoPath, { name: 'logo_sasp_final.png' });

                const embedFerme = new EmbedBuilder()
                    .setColor('#000644')
                    .setAuthor({ name: 'San Andreas State Police - Recruitment Bureau', iconURL: 'attachment://logo_sasp_final.png' })
                    .setTitle('🔒 | Fermeture des candidatures - Police Academy')
                    .setThumbnail('attachment://logo_sasp_final.png')
                    .setDescription(`▪️ **Communiqué Officiel – SASP**\n\nL'État-Major de la San Andreas State Police annonce la **clôture officielle** de la campagne de recrutement pour la présente session de la Police Academy.\n\nLe Bureau du Recrutement procède actuellement à l'examen rigoureux des dossiers soumis. Les candidats dont le profil correspond aux exigences de notre département recevront prochainement une convocation pour la suite du processus d'intégration.\n\nNous tenons à saluer l'engagement civique et l'intérêt porté à notre institution par l'ensemble des postulants. Pour les citoyens n'ayant pas pu soumettre leur candidature à temps, nous vous invitons à rester informés de nos futures campagnes.\n\n*Servir et Protéger.*`)
                    .setFooter({ text: 'État Major SASP' })
                    .setTimestamp();

                // 🔄 TRANSFORMATION DU PANNEAU EN TRACE
                await interaction.update({ 
                    content: `🔒 **Trace :** L'annonce de fermeture des recrutements a bien été envoyée par ${interaction.user}.`, 
                    components: [] 
                });

                // 🧹 NETTOYAGE DU SALON CIBLE
                try {
                    const fetched = await salonCible.messages.fetch({ limit: 10 });
                    await salonCible.bulkDelete(fetched, true);
                } catch (error) {
                    console.error("Erreur lors du nettoyage du salon :", error);
                }

                // 📤 ENVOI DE L'EMBED D'ABORD
                await salonCible.send({ files: [logoFile], embeds: [embedFerme] });
                
                // 🔔 PING FANTÔME ENSUITE
                const pingMsg = await salonCible.send("@everyone");
                await pingMsg.delete().catch(()=>{});
            }
        }

        // ==========================================
        // 2️⃣ GESTION DE LA RÉPONSE AU FORMULAIRE (Ouverture)
        // ==========================================
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_ouvert') {
                const salonCibleId = '1487835953824530463';
                const salonCible = interaction.guild.channels.cache.get(salonCibleId);
                if (!salonCible) return interaction.reply({ content: "❌ Salon cible introuvable.", ephemeral: true });

                const logoPath = path.join(__dirname, '..', 'logo.png');
                const logoFile = new AttachmentBuilder(logoPath, { name: 'logo_sasp_final.png' });

                const secteurRaw = interaction.fields.getTextInputValue('input_secteur').toUpperCase();
                let secteurText = secteurRaw; 
                if (secteurRaw.includes('NORD') && secteurRaw.includes('SUD') || secteurRaw.includes('DEUX')) {
                    secteurText = 'SUD & NORD';
                } else if (secteurRaw.includes('NORD')) {
                    secteurText = 'NORD';
                } else if (secteurRaw.includes('SUD')) {
                    secteurText = 'SUD';
                }

                const dates = interaction.fields.getTextInputValue('input_dates');

                const embedOuvert = new EmbedBuilder()
                    .setColor('#000644')
                    .setAuthor({ name: 'San Andreas State Police - Recruitment Bureau', iconURL: 'attachment://logo_sasp_final.png' })
                    .setTitle('📝 | Déposer votre candidature - Police Academy')
                    .setThumbnail('attachment://logo_sasp_final.png')
                    .setDescription(`▪️ **Communiqué Officiel – SASP**\nL'État-Major de la San Andreas State Police a le plaisir de vous annoncer l'ouverture officielle des candidatures pour la prochaine session de la Police Academy.\n\nNous recherchons des profils rigoureux, dévoués et prêts à s'investir pour la sécurité de l'État. Avant toute démarche, nous vous prions de bien vouloir prendre connaissance de l'ensemble des prérequis et des modalités d'intégration.\n\n⚠️ *Assurez-vous de soumettre un dossier complet et soigné. Toute candidature incomplète sera automatiquement rejetée.*\n\nㅤ\n\n▪️ **Informations de la session :**\n📍 **Secteur(s) recrutant :** ${secteurText}\n🗓️ **Dates de la formation :** ${dates}\n\n🔗 **[Cliquez ici pour accéder au formulaire de candidature](https://discord.com)**`)
                    .setFooter({ text: 'État Major SASP' })
                    .setTimestamp();

                // 🔄 TRANSFORMATION DU PANNEAU EN TRACE
                await interaction.update({ 
                    content: `🟢 **Trace :** L'annonce pour l'école de police ${dates} pour le secteur **${secteurText}** a bien été envoyée par ${interaction.user}.`, 
                    components: [] 
                });

                // 🧹 NETTOYAGE DU SALON CIBLE
                try {
                    const fetched = await salonCible.messages.fetch({ limit: 10 });
                    await salonCible.bulkDelete(fetched, true);
                } catch (error) {
                    console.error("Erreur lors du nettoyage du salon :", error);
                }

                // 📤 ENVOI DE L'EMBED D'ABORD
                await salonCible.send({ files: [logoFile], embeds: [embedOuvert] });
                
                // 🔔 PING FANTÔME ENSUITE
                const pingMsg = await salonCible.send("@everyone");
                await pingMsg.delete().catch(()=>{});
            }
        }
    }
};