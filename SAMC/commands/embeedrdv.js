const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'embeedrdv',
    async execute(message, args) {
        // --- SÉCURITÉ SALON ---
        const salonAutoriseId = '1489643979921297439';
        if (message.channel.id !== salonAutoriseId) {
            const warning = await message.reply(`❌ Cette commande ne peut être utilisée que dans <#${salonAutoriseId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- SÉCURITÉ RÔLES ---
        const rolesAutorises = ['1489641130206298303', '1487833898150006956', '1487833901849120788'];
        const possedeLeRole = rolesAutorises.some(roleId => message.member.roles.cache.has(roleId));
        if (!possedeLeRole) {
            const warning = await message.reply("❌ Vous n'avez pas les habilitations nécessaires.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- PRÉPARATION DU LOGO ---
        const logoPath = path.join(__dirname, '../picture/logo.png');
        const logoFile = new AttachmentBuilder(logoPath);

        // --- L'EMBED ROUGE #8a0303 AVEC LOGO ---
        const embed = new EmbedBuilder()
            .setTitle('🏥 PRISE DE RENDEZ-VOUS – SAMC')
            .setColor('#8a0303')
            .setThumbnail('attachment://logo.png') // Utilise le logo joint
            .setDescription('Besoin d’un rendez-vous avec l’un de nos services ?\n\nSélectionne la catégorie correspondante ci-dessous afin d’être pris en charge rapidement.')
            .addFields(
                { 
                    name: '🫂 Psychologue', 
                    value: 'Pour un suivi psychologique, parler de vos difficultés ou simplement échanger en toute confidentialité.', 
                    inline: false 
                },
                { 
                    name: '⚰️ Responsable de la morgue', 
                    value: 'Pour toute information, démarche administrative ou gestion liée à la morgue.', 
                    inline: false 
                },
                { 
                    name: '🌸 Gynécologue', 
                    value: 'Pour vos consultations, suivis, examens ou conseils spécialisés.', 
                    inline: false 
                },
                { 
                    name: '💉 Analyses médicales', 
                    value: 'Pour effectuer vos prises de sang, examens urinaires ou bilans médicaux.', 
                    inline: false 
                },
                { 
                    name: '💊 Direction', 
                    value: 'Pour toute demande importante, administrative ou situation nécessitant une prise en charge particulière.', 
                    inline: false 
                },
                { 
                    name: '📌 Informations', 
                    value: 'Merci de choisir la bonne catégorie afin de faciliter le traitement de votre demande.\n\nUn membre du SAMC vous répondra dans les plus brefs délais.', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Direction du SAMC - San Andreas' })
            .setTimestamp();

        // --- LE SÉLECTEUR ---
        const menu = new StringSelectMenuBuilder()
            .setCustomId('menu_rdv_samc')
            .setPlaceholder('Cliquez ici pour choisir un service...')
            .addOptions([
                { label: 'Psychologue', description: 'Suivi psychologique et écoute', value: 'psy', emoji: '🫂' },
                { label: 'Responsable de la morgue', description: 'Gestion administrative et morgue', value: 'morgue', emoji: '⚰️' },
                { label: 'Gynécologue', description: 'Consultations spécialisées', value: 'gyneco', emoji: '🌸' },
                { label: 'Analyses médicales', description: 'Prises de sang et bilans', value: 'analyses', emoji: '💉' },
                { label: 'Direction', description: 'Demandes administratives importantes', value: 'direction', emoji: '💊' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        // --- ENVOI DANS LE SALON PUBLIC ---
        const salonCibleId = '1489690096591573114';
        const salonCible = message.guild.channels.cache.get(salonCibleId);

        if (salonCible) {
            // IMPORTANT : On envoie l'embed ET le fichier image en même temps
            await salonCible.send({ 
                embeds: [embed], 
                components: [row],
                files: [logoFile] 
            });
            
            const success = await message.reply(`✅ Le panneau de rendez-vous a été envoyé dans <#${salonCibleId}>.`);
            setTimeout(() => { 
                success.delete().catch(()=>{}); 
                message.delete().catch(()=>{}); 
            }, 5000);
        } else {
            message.reply("❌ Erreur : Le salon cible est introuvable.");
        }
    }
};