// src/events/soutenirCommand.js

const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // On ignore les messages provenant d'autres bots
        if (message.author.bot) return;

        // --- CONFIGURATION ---
        // La commande à taper dans n'importe quel salon
        const commandName = '!soutenir'; 
        
        // ID du rôle autorisé à faire la commande
        const roleRequiredId = '1502295098560352509'; 
        
        // ID du salon où l'embed sera envoyé
        const targetChannelId = '1503066306331541705'; 

        // 1. Vérification de la commande
        if (message.content === commandName) {
            
            // 2. Vérification des permissions (si la personne n'a pas le rôle, le bot l'ignore)
            if (!message.member.roles.cache.has(roleRequiredId)) {
                return; 
            }

            // 3. Récupération du salon cible
            const targetChannel = message.guild.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                return message.reply("❌ Erreur : Le salon de destination est introuvable avec cet ID.");
            }

            // 4. Création de l'embed
            const embed = new EmbedBuilder()
                .setTitle('💖 Soutenir Nuxa')
                .setDescription(`Coucou tout le monde ! 👋\n\nSi vous souhaitez soutenir Nuxa et l'aider à développer ses projets, vous pouvez faire un don en toute sécurité via PayPal.\n\nChaque geste, petit ou grand, compte énormément. Merci du fond du cœur à tous ceux qui apporteront leur soutien ! 🙏\n\n👉 **[Cliquez ici pour soutenir via PayPal](https://www.paypal.com/paypalme/LoraDiers)**`)
                .setColor('#fc78f3') // <-- La nouvelle couleur est appliquée ici !
                .setFooter({ text: 'Merci infiniment pour votre soutien ! ❤️' });

            try {
                // 5. Envoi de l'embed dans le salon spécifié
                await targetChannel.send({ embeds: [embed] });
                
                // 6. Petit message de confirmation pour toi, qui s'efface tout seul au bout de 5 secondes
                const reply = await message.reply("✅ L'embed de soutien a bien été envoyé dans le salon avec la bonne couleur !");
                setTimeout(() => {
                    reply.delete().catch(() => {});
                    message.delete().catch(() => {}); // Supprime aussi ton message "!soutenir" pour faire propre
                }, 5000);

            } catch (error) {
                console.error("Erreur lors de l'envoi de l'embed soutenir :", error);
                await message.reply("❌ Une erreur est survenue lors de l'envoi du message. Vérifie que le bot a bien la permission de parler dans le salon cible.");
            }
        }
    },
};