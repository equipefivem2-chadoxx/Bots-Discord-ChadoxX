const ticketState = require('../functions/ticketState.js');

module.exports = {
    name: 'alert',
    description: 'Être notifié quand le joueur répond',

    async execute(message, args, client) {
        const channelId = message.channel.id;
        const staffId = message.author.id;

        if (!ticketState.alerts.has(channelId)) {
            ticketState.alerts.set(channelId, new Set());
        }

        const channelAlerts = ticketState.alerts.get(channelId);

        if (channelAlerts.has(staffId)) {
            channelAlerts.delete(staffId);
            await message.reply("🔕 Tu ne recevras plus d'alertes pour ce ticket.");
        } else {
            channelAlerts.add(staffId);
            await message.reply("🔔 Tu seras mentionné dès que le citoyen enverra un nouveau message !");
        }
    }
};