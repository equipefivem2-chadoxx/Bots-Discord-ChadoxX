const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: { 
        name: 'embeedrc' 
    },
    name: 'embeedrc',
    async execute(message, args) {
        // --- SÉCURITÉ SALON DE COMMANDE ---
        const salonCommandeId = '1490116027298742446';
        if (message.channel.id !== salonCommandeId) {
            const warning = await message.reply(`❌ Cette commande doit être utilisée dans <#${salonCommandeId}>.`);
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- SÉCURITÉ RÔLE ---
        const roleAutoriseId = '1487835814326046830'; 
        if (!message.member.roles.cache.has(roleAutoriseId)) {
            const warning = await message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
            setTimeout(() => { warning.delete().catch(()=>{}); message.delete().catch(()=>{}); }, 5000);
            return;
        }

        // --- PRÉPARATION DU LOGO LOCAL ---
        const logoPath = path.join(__dirname, '..', 'logo.png'); 
        const logoFile = new AttachmentBuilder(logoPath, { name: 'logo_sasp_final.png' });

        // --- CRÉATION DE L'EMBED "ACADÉMIE DE POLICE" ---
        const embedRC = new EmbedBuilder()
            .setColor('#000644') // Bleu SASP
            .setAuthor({
                name: 'San Andreas State Police - Training Bureau',
                iconURL: 'attachment://logo_sasp_final.png'
            })
            .setTitle('🚔 | Académie de Police')
            .setThumbnail('attachment://logo_sasp_final.png')
            .addFields(
                {
                    name: '▪️ Rejoindre le département',
                    value: "Lorsque les candidatures sont ouvertes, une annonce sera publiée afin de vous permettre de postuler. Un formulaire vous sera alors transmis : il devra être rempli avec sérieux, précision et cohérence."
                },
                {
                    name: '▪️ Choisir son secteur',
                    value: "Au moment de votre inscription, vous devrez sélectionner le secteur dans lequel vous souhaitez évoluer : SASP Nord ou SASP Sud.\nCe choix déterminera votre zone d’intervention ainsi que votre cadre de travail. Il aura également un impact sur vos futures missions et votre progression au sein du département.\n\n📍 **SASP Nord :** Sandy Shores, Paleto Bay, Grapeseed\n📍 **SASP Sud :** Los Santos"
                },
                {
                    name: '▪️ À savoir avant de postuler',
                    value: "La candidature représente une première étape de sélection pour intégrer l’Académie de Police. Si votre profil est retenu, vous serez convoqué pour un entretien avant une phase de formation mêlant théorie et pratique.\n\nLa présence à l’ensemble de la formation est obligatoire. Les dates seront communiquées à l’avance afin que vous puissiez vous organiser.\nLes candidatures étant limitées dans le temps, seuls les profils sélectionnés recevront une réponse.\n\nAprès l’envoi de votre dossier, une réponse peut vous être transmise jusqu’à 24 heures avant le début de la formation. Les candidats retenus recevront une convocation avec toutes les informations nécessaires.\n*⚠️ Sans réponse dans ce délai, cela signifie que votre candidature n’a pas été retenue.*"
                },
                {
                    name: '▪️ Profil recherché',
                    value: "Le SASP recrute des personnes sérieuses, investies et capables d’incarner leur rôle avec professionnalisme. Votre implication, votre comportement et votre motivation seront des éléments clés tout au long du processus."
                }
            )
            .setFooter({ text: 'SASP - Académie de Police' })
            .setTimestamp();

        // --- ENVOI DANS LE SALON CIBLE ---
        const salonCibleId = '1487835948585844868';
        const salonCible = message.guild.channels.cache.get(salonCibleId);

        if (salonCible) {
            await salonCible.send({
                files: [logoFile],
                embeds: [embedRC] 
            });
            
            const success = await message.reply(`✅ Le panneau de l'Académie a été envoyé dans <#${salonCibleId}>.`);
            setTimeout(() => { 
                success.delete().catch(()=>{}); 
                message.delete().catch(()=>{}); 
            }, 5000);
        } else {
            message.reply("❌ Erreur : Le salon cible est introuvable.");
        }
    }
};