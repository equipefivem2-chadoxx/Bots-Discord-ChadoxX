const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    async verifierSpamCandidature(interaction, identite) {
        // Chemin vers notre petite base de données locale
        const dbPath = path.join(__dirname, 'db_candidatures.json');

        // On crée le fichier s'il n'existe pas encore
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify({}));
        }

        // On lit le fichier
        let db = {};
        try {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (err) {
            console.error("Erreur de lecture db_candidatures:", err);
        }

        const userId = interaction.user.id;

        // On incrémente son nombre de candidatures
        if (!db[userId]) {
            db[userId] = 1;
        } else {
            db[userId] += 1;
        }

        // On sauvegarde
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));

        // 🚨 SI LE JOUEUR A ENVOYÉ 2 CANDIDATURES OU PLUS -> ALERTE
        if (db[userId] >= 2) {
            const salonAlerteId = '1490459178676781228';
            const salonAlerte = interaction.guild.channels.cache.get(salonAlerteId);

            if (salonAlerte) {
                const embedAlerte = new EmbedBuilder()
                    .setTitle('⚠️ Alerte Multi-Candidatures')
                    .setColor('#ff8c00') // Orange d'alerte
                    .setDescription(`🚨 **Avertissement de sécurité**\n\nLe citoyen <@${userId}> (Nom RP : **${identite}**) vient d'envoyer sa **${db[userId]}ème candidature**.\n\nVous pouvez donc le refuser du SAMC.`)
                    .setFooter({ text: 'Système de sécurité SAMC' })
                    .setTimestamp();

                // 🔔 LE PING DIRECTION EST AJOUTÉ ICI DANS LE CONTENT
                await salonAlerte.send({ 
                    content: `<@&1487833910082539582> ⚠️ <@${userId}> spam les candidatures !`, 
                    embeds: [embedAlerte] 
                });
            }
        }
    }
};