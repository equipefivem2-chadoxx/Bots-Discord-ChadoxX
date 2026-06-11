// src/events/yeuxCommand.js

const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // On ignore les bots
        if (message.author.bot) return;

        // --- CONFIGURATION ---
        const commandName = '!yeux'; 
        const roleRequiredId = '1502295098560352509'; // Ton rôle staff
        const targetChannelId = '1502295369021788230'; // ID du salon de destination

        if (message.content === commandName) {
            
            // Vérification du rôle
            if (!message.member.roles.cache.has(roleRequiredId)) {
                return; 
            }

            const targetChannel = message.guild.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                return message.reply("❌ Erreur : Le salon est introuvable avec cet ID.");
            }

            // --- LE MESSAGE TEASING ---
            const messageContent = "👀 Une nouvelle ville arrive à grands pas...\nSoyez prêts, l'aventure commencera d'ici peu.\n\n**S O O N . . .** ⏳";

            try {
                // Envoi du message en format texte normal (pas d'embed)
                await targetChannel.send(messageContent);
                
                // On supprime ton message "!yeux" pour garder le mystère
                message.delete().catch(() => {});

            } catch (error) {
                console.error("Erreur lors de l'envoi du message !yeux :", error);
                await message.reply("❌ Une erreur est survenue lors de l'envoi.");
            }
        }
    },
};