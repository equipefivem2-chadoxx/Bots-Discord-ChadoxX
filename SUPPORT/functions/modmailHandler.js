const { ChannelType, EmbedBuilder } = require('discord.js');
const ticketState = require('./ticketState.js'); 
const fs = require('fs');
const path = require('path');

const MOD_SERVER_ID = '1488475687563169884'; 
const CATEGORY_ID = '1488478822599753818';  
 
const IGNORED_ROLES = [
    '1488477395668439231', 
    '1488477433488347177', 
    '1488477029689983016', 
    '1488477065115340971'
];

module.exports = {
    async handleDM(message, client) {
// --- 🚨 SYSTÈME DE BLACKLIST : BARRAGE 🚨 ---
        const blacklistPath = path.join(__dirname, '../data/blacklist.json');
        if (fs.existsSync(blacklistPath)) {
            const db = JSON.parse(fs.readFileSync(blacklistPath, 'utf-8'));
            const userBl = db[message.author.id];
            
            if (userBl) {
                // Si la sanction est à vie, OU si la date d'expiration n'est pas encore passée
                if (userBl.expireAt === null || userBl.expireAt > Date.now()) {
                    const blMessage = "Bonjour,\n\nSi vous recevez ce message, c'est que votre accès au système de support a été révoqué par l'administration.\nVous êtes actuellement banni des tickets et vous ne pouvez plus contacter le staff via ce biais.\n\nMerci de votre compréhension,\n**L'équipe de modération IrisFA.**";
                    
                    // On prévient le joueur en MP et on BLOQUE la suite du code
                    await message.author.send(blMessage).catch(() => {});
                    return; 
                } else {
                    // La sanction est expirée, on le supprime de la base de données
                    delete db[message.author.id];
                    fs.writeFileSync(blacklistPath, JSON.stringify(db, null, 4));
                }
            }
        }
        // --- FIN DU BARRAGE BLACKLIST ---

        let guild = await client.guilds.fetch(MOD_SERVER_ID).catch(() => null);
        if (!guild) return;

        // 🚨 MÉMOIRE ABSOLUE
        await guild.channels.fetch();

        // 🚨 LECTURE DE LA LISTE DES SUSPENDUS
        const suspendedPath = path.join(__dirname, 'suspended.json');
        let suspended = [];
        if (fs.existsSync(suspendedPath)) suspended = JSON.parse(fs.readFileSync(suspendedPath));

        // 🚨 RECHERCHE GLOBALE : On ignore les salons présents dans suspended.json
        let ticketChannel = guild.channels.cache.find(c => 
            c.topic === message.author.id && 
            !suspended.includes(c.id)
        );

        let contenuMessage = message.content || "*Aucun texte*";
        if (message.attachments.size > 0) {
            contenuMessage += `\n\n**Pièce(s) jointe(s) :**\n${message.attachments.map(a => a.url).join('\n')}`;
        }

        if (!ticketChannel) {
            try {
                let safeName = message.author.username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                ticketChannel = await guild.channels.create({
                    name: safeName, 
                    type: ChannelType.GuildText,
                    parent: CATEGORY_ID,
                    topic: message.author.id
                });

                const infoText = `**NOUVELLE DEMANDE DE SUPPORT**\n**Citoyen :** ${message.author.tag} (<@${message.author.id}>)\n**ID Discord :** \`${message.author.id}\`\n**Création du compte :** <t:${Math.floor(message.author.createdTimestamp / 1000)}:R>\n**Heure d'ouverture :** <t:${Math.floor(Date.now() / 1000)}:F>`;

                const msgEmbed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                    .setDescription(contenuMessage)
                    .setFooter({ text: message.id }); 

                await ticketChannel.send({ content: infoText, embeds: [msgEmbed] });

                const userEmbed = new EmbedBuilder()
                    .setColor('#E6D5B8')
                    .setDescription("Salut !\nMerci pour ton message.\nIl a été transmis à l’équipe du staff. Si certaines informations sont manquantes, n’hésite pas à les ajouter.");
                
                await message.author.send({ embeds: [userEmbed] });

            } catch (error) {
                console.error("Erreur création salon :", error.message);
            }
        } else {
            const msgEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setDescription(contenuMessage)
                .setFooter({ text: message.id }); 
            
            await ticketChannel.send({ embeds: [msgEmbed] });

            // ANNULATION DU TIMER (!x)
            if (ticketState.timers.has(ticketChannel.id)) {
                clearTimeout(ticketState.timers.get(ticketChannel.id));
                ticketState.timers.delete(ticketChannel.id);
                
                await ticketChannel.send('⏰ **Fermeture automatique annulée** suite à la réponse du citoyen.');
            }

// SYSTÈME D'ALERTE (!alert) (Version "One-Shot")
            if (ticketState.alerts.has(ticketChannel.id)) {
                const staffIds = ticketState.alerts.get(ticketChannel.id);
                if (staffIds.size > 0) {
                    const pings = Array.from(staffIds).map(id => `<@${id}>`).join(' ');
                    await ticketChannel.send(`🔔 **Nouveau message :** ${pings}`);
                    
                    // ✨ NOUVEAU : On vide la liste des alertes après avoir pingé !
                    staffIds.clear();
                }
            }
        }
    },

    async handleReply(message, args, client) {
        const userId = message.channel.topic;
        if (!userId) return; 

        const replyText = args.join(' ');
        if (!replyText) return;

        try {
            const user = await client.users.fetch(userId);
            const validRoles = message.member.roles.cache.filter(r => !IGNORED_ROLES.includes(r.id) && r.name !== '@everyone');
            const highestRoleObj = validRoles.sort((a, b) => b.position - a.position).first();
            const highestRole = highestRoleObj ? highestRoleObj.name : 'Staff'; 
            
            const formattedMessage = `**(${highestRole}) ${message.author.username} :** ${replyText}`;
            await user.send(formattedMessage);
            await message.channel.send(formattedMessage);
            await message.delete().catch(() => {}); 
        } catch (error) {
            message.channel.send("Impossible d'envoyer le message au joueur (MP bloqués).");
        }
    },

    async handleEdit(newMessage, client) {
        let guild = await client.guilds.fetch(MOD_SERVER_ID).catch(() => null);
        if (!guild) return;

        await guild.channels.fetch(); 

        const suspendedPath = path.join(__dirname, 'suspended.json');
        let suspended = [];
        if (fs.existsSync(suspendedPath)) suspended = JSON.parse(fs.readFileSync(suspendedPath));

        let ticketChannel = guild.channels.cache.find(c => c.topic === newMessage.author.id && !suspended.includes(c.id));
        if (!ticketChannel) return;

        let messages = await ticketChannel.messages.fetch({ limit: 100 });
        let targetMsg = messages.find(m => m.embeds.length > 0 && m.embeds[0].footer?.text === newMessage.id);

        if (targetMsg) {
            const oldEmbed = targetMsg.embeds[0];
            let cleanOld = oldEmbed.description.split('\n\n**✏️ Modifié :**')[0].replace(/~~/g, ''); 
            
            let newContent = newMessage.content || "*Aucun texte*";
            if (newMessage.attachments.size > 0) newContent += `\n📎 Image attachée.`;

            const updatedEmbed = EmbedBuilder.from(oldEmbed)
                .setDescription(`~~${cleanOld}~~ \n\n**✏️ Modifié :**\n${newContent}`);

            await targetMsg.edit({ embeds: [updatedEmbed] });
        }
    },

    async handleDelete(messageId, userId, client) {
        let guild = await client.guilds.fetch(MOD_SERVER_ID).catch(() => null);
        if (!guild) return;

        await guild.channels.fetch(); 

        const suspendedPath = path.join(__dirname, 'suspended.json');
        let suspended = [];
        if (fs.existsSync(suspendedPath)) suspended = JSON.parse(fs.readFileSync(suspendedPath));

        let ticketChannel = guild.channels.cache.find(c => c.topic === userId && !suspended.includes(c.id));
        if (!ticketChannel) return;

        let messages = await ticketChannel.messages.fetch({ limit: 100 });
        let targetMsg = messages.find(m => m.embeds.length > 0 && m.embeds[0].footer?.text === messageId);

        if (targetMsg) {
            const oldEmbed = targetMsg.embeds[0];
            let cleanOld = oldEmbed.description.split('\n\n**✏️ Modifié :**').pop().replace(/~~/g, ''); 

            const deletedEmbed = EmbedBuilder.from(oldEmbed)
                .setColor('#262729')
                .setDescription(`~~${cleanOld}~~ \n\n**🗑️ (Message supprimé par le citoyen)**`);

            await targetMsg.edit({ embeds: [deletedEmbed] });
        }
    }
};