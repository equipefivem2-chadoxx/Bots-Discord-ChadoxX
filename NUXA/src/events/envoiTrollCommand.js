// src/events/envoiTrollCommand.js

const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // On ignore les bots
        if (message.author.bot) return;

        // --- CONFIGURATION ---
        const commandName = '!envoitroll'; 
        const roleRequiredId = '1502295098560352509'; // Ton rôle staff
        
        const targetChannelId = '1502295369021788230'; // ID du salon
        
        // L'ID du message auquel le bot va répondre
        const targetMessageId = '1503181169305452544'; 

        if (message.content === commandName) {
            
            // Vérification du rôle
            if (!message.member.roles.cache.has(roleRequiredId)) {
                return; 
            }

            const targetChannel = message.guild.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                return message.reply("❌ Erreur : Le salon est introuvable avec cet ID.");
            }

            try {
                // 1. Le bot va chercher le message précis dans le salon
                const targetMessage = await targetChannel.messages.fetch(targetMessageId);
                
                // 2. Le bot répond directement à ce message avec "deux ?"
                // Le paramètre "repliedUser: true" force Discord à le mentionner (ping)
                await targetMessage.reply({ 
                    content: "deux ?",
                    allowedMentions: { repliedUser: true } 
                });
                
                // 3. On supprime ton message "!envoitroll" pour faire le mec mystérieux
                message.delete().catch(() => {});

            } catch (error) {
                console.error("Erreur lors de l'envoi du message troll :", error);
                await message.reply("❌ Erreur : Impossible de trouver le message. Soit l'ID est incorrect, soit le message a été supprimé.");
            }
        }
    },
};