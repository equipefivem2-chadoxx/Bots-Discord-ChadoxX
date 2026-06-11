const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // On ignore les autres bots
        if (message.author.bot) return;

        // ==========================================
        // 1. SYSTÈME DE RÉCAPITULATIF (FILE D'ATTENTE)
        // ==========================================
        const fileAttenteId = '1489762348192235521';
        
        if (message.channel.id === fileAttenteId) {
            try {
                const msgs = await message.channel.messages.fetch({ limit: 50 });
                const count = msgs.filter(m => 
                    m.components.some(row => 
                        row.components.some(btn => btn.customId === 'btn_contacted')
                    )
                ).size;
                
                const oldRecap = msgs.find(m => m.author.id === client.user.id && m.content.includes('RÉCAPITULATIF DES CONTACTS'));
                if (oldRecap) {
                    await oldRecap.delete().catch(()=>{});
                }

                const texteRecap = `📊 **RÉCAPITULATIF DES CONTACTS**\nIl reste actuellement **${count}** candidat(s) à contacter dans la file d'attente.`;
                await message.channel.send({ content: texteRecap });
            } catch (error) {
                console.error("Erreur avec le récapitulatif :", error);
            }
        }

        // ==========================================
        // 2. SYSTÈME DE LECTURE DES COMMANDES
        // ==========================================
        // Si le message ne commence pas par "!", on arrête là
        if (!message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        // Si la commande n'existe pas, le bot ignore silencieusement
        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de !${commandName} :`, error);
            message.reply("Une erreur est survenue lors de l'exécution de cette commande.").catch(() => {});
        }
    },
};