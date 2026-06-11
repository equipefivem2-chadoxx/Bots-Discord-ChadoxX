// src/events/leakRpCommand.js

const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // On ignore les bots
        if (message.author.bot) return;

        // --- CONFIGURATION ---
        const commandName = '!leakrp'; 
        const roleRequiredId = '1502295098560352509'; // Ton rôle staff autorisé
        const targetChannelId = '1502337880868131016'; // Le salon RP
        
        // La couleur Beige "Jolie"
        const beigeColor = '#E5D3B3'; 

        if (message.content === commandName) {
            
            // Vérification du rôle
            if (!message.member.roles.cache.has(roleRequiredId)) {
                return; 
            }

            const targetChannel = message.guild.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                return message.reply("❌ Erreur : Le salon RP est introuvable.");
            }

            // Création de l'embed mystérieux
            const embed = new EmbedBuilder()
                .setTitle('👁️‍🗨️ Un nouveau monde se prépare...')
                .setDescription(`Le silence est d'or, mais les rumeurs courent... 🌆\n\nQuelque chose de grand se prépare dans l'ombre. Préparez-vous à écrire votre propre histoire, car la ville ouvrira bientôt ses portes.\n\n**S O O N . . .** ⏳`)
                .setColor(beigeColor)
                .setImage('https://media.giphy.com/media/3o7TKsQ8gE0bJ220xi/giphy.gif') // Un petit GIF statique/mystérieux en option (tu peux l'enlever ou le changer)
                .setFooter({ text: 'Restez à l\'affût...' });

            try {
                // Envoi du message
                await targetChannel.send({ embeds: [embed] });
                
                // Nettoyage automatique
                const reply = await message.reply("✅ Le leak RP a été envoyé avec succès !");
                setTimeout(() => {
                    reply.delete().catch(() => {});
                    message.delete().catch(() => {});
                }, 5000);

            } catch (error) {
                console.error("Erreur lors de l'envoi de l'embed RP :", error);
                await message.reply("❌ Une erreur est survenue lors de l'envoi.");
            }
        }
    },
};