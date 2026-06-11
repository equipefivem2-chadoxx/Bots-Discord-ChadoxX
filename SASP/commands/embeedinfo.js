const { EmbedBuilder, AttachmentBuilder } = require('discord.js'); // On importe AttachmentBuilder
const path = require('path'); // On importe path pour lier le fichier proprement

module.exports = {
    data: { 
        name: 'embeedinfo' 
    },
    name: 'embeedinfo',
    async execute(message, args) {
        // --- SÉCURITÉ SALON DE COMMANDE --- (Kept)
        const salonCommandeId = '1490116027298742446';
        if (message.channel.id !== salonCommandeId) {
            const warning = await message.reply(`❌ Cette commande doit être utilisée dans <#${salonCommandeId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- SÉCURITÉ RÔLE --- (Kept)
        const roleAutoriseId = '1487835814326046830'; 
        if (!message.member.roles.cache.has(roleAutoriseId)) {
            const warning = await message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- PRÉPARATION DU LOGO LOCAL ---
        // On récupère le chemin vers logo.png à la racine du dossier SASP
        const logoPath = path.join(__dirname, '..', 'logo.png'); // On remonte d'un dossier (../) depuis commands/
        const logoFile = new AttachmentBuilder(logoPath, { name: 'logo_sasp_final.png' }); // On lui donne un nom interne

        // --- CRÉATION DE L'EMBED AMÉLIORÉ ---
        const embedInfo = new EmbedBuilder()
            .setColor('#000644') // Ton bleu foncé

            // 1. En-tête (Auteur) avec le logo
            .setAuthor({
                name: 'San Andreas State Police - Direction',
                iconURL: 'attachment://logo_sasp_final.png' // On utilise le logo comme icône d'auteur
            })

            // 2. Grand Titre
            .setTitle('📢 | Communication Officielle – Recrutement')

            // 3. Thumbnail (Logo en haut à droite)
            .setThumbnail('attachment://logo_sasp_final.png') // On utilise aussi le logo ici

            // 4. Contenu utilisant des FIELDS (beaucoup plus propre pour les informations)
            .addFields(
                {
                    name: '🔹 Statut des Recrutements',
                    value: 'Une nouvelle promotion de recrues a récemment été intégrée au sein du département, marquant la reprise des formations au sein des secteurs Nord et Sud.\n\nDe nouvelles sessions de recrutement seront mises en place de manière régulière dans les semaines à venir, en fonction des besoins du service.'
                },
                {
                    name: '📍 Informations complémentaires',
                    value: 'Les dates des prochaines incorporations seront communiquées en amont selon le secteur concerné.\n\nÀ tout moment, vous avez la possibilité de vous rendre dans les différents postes de police afin d’échanger avec un instructeur. Ils sont disponibles pour répondre à vos questions.'
                }
            )

            // 5. Footer & Timestamp (Kept)
            .setFooter({ text: 'SASP - Communication Department' })
            .setTimestamp();

        // --- ENVOI DANS LE SALON CIBLE --- (Modified to send files and embeds)
        const salonCibleId = '1487835936158122035';
        const salonCible = message.guild.channels.cache.get(salonCibleId);

        if (salonCible) {
            // !!! IL FAUT ENVOYER LE FICHIER ET L'EMBED EN MÊME TEMPS !!!
            await salonCible.send({
                files: [logoFile], // On envoie l'image attachée
                embeds: [embedInfo]  // On envoie l'embed qui utilise cette image
            });
            
            const success = await message.reply(`✅ Le panneau d'information amélioré a été envoyé dans <#${salonCibleId}>.`);
            // Nettoyage automatique
            setTimeout(() => { 
                success.delete().catch(()=>{}); 
                message.delete().catch(()=>{}); 
            }, 5000);
        } else {
            message.reply("❌ Erreur : Le salon cible est introuvable.");
        }
    }
};