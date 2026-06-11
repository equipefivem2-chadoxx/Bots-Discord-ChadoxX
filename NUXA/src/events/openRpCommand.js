// src/events/infoRpCommand.js

const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // On ignore les bots
        if (message.author.bot) return;

        // --- CONFIGURATION ---
        const commandName = '!inforp'; // Nouvelle commande
        const roleRequiredId = '1502295098560352509'; 
        const targetChannelId = '1502337880868131016'; 
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

            // --- PRÉPARATION DE L'IMAGE LOCALE ---
            const logoPath = path.join(__dirname, '../pictures/logorp.png');
            const file = new AttachmentBuilder(logoPath, { name: 'logorp.png' });

            // --- CRÉATION DE L'EMBED ---
            const embed = new EmbedBuilder()
                .setTitle('⚜️ Présentation d\'IrisFA')
                .setDescription(`Bienvenue sur **IrisFA**, notre serveur RolePlay ! 🏙️\n\nQue vous soyez un citoyen modèle, un entrepreneur ambitieux ou que vous préfériez les affaires de l'ombre, la ville n'attend plus que vous pour s'animer. \n\nRejoignez une communauté passionnée et venez écrire votre propre histoire avec nous.\n\n🔗 **[Cliquez ici pour rejoindre le Discord IrisFA](https://discord.gg/kaT7c6n8xv)**`)
                .setColor(beigeColor)
                .setThumbnail('attachment://logorp.png') 
                .setFooter({ text: 'IrisFA RolePlay • Votre nouvelle vie commence ici' });

            try {
                // Envoi du message
                await targetChannel.send({ embeds: [embed], files: [file] });
                
                // Nettoyage automatique
                const reply = await message.reply("✅ L'embed d'information RP a été envoyé !");
                setTimeout(() => {
                    reply.delete().catch(() => {});
                    message.delete().catch(() => {});
                }, 5000);

            } catch (error) {
                console.error("Erreur lors de l'envoi de l'embed d'info RP :", error);
                await message.reply("❌ Une erreur est survenue lors de l'envoi.");
            }
        }
    },
};