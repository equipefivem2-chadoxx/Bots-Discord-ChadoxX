// src/events/guildMemberAddDM.js

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            // Envoi d'un message privé au nouveau membre
            await member.send(`👋 Bienvenue sur le serveur ${member.user.username} !\n\nN'oublie pas d'aller dans le salon règlement et de le valider pour obtenir ton rôle et accéder au reste du serveur.`);
        } catch (error) {
            // Les membres peuvent avoir bloqué les MP de serveurs
            console.error(`Impossible d'envoyer un MP à ${member.user.tag}. Il a désactivé ses MP.`);
        }
    },
};