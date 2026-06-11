const fs = require('fs');
const path = require('path');

const CHANNEL_ID = '1490165766136266803';
const STATUS_FILE = path.join(__dirname, 'status.json');

module.exports = {
    async checkStatus(client, statusOverride = null) {
        const currentStatus = statusOverride || "OFF"; 
        
        let data = { lastStatus: "UNKNOWN" };
        if (fs.existsSync(STATUS_FILE)) {
            data = JSON.parse(fs.readFileSync(STATUS_FILE));
        }

        if (currentStatus !== data.lastStatus) {
            const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
            if (channel) {
                let text = "";

                switch (currentStatus) {
                    case "ON":
                        text = "🟢 Le serveur IrisFA est désormais : **En ligne (ON)**. Bon jeu à tous !";
                        break;
                    case "OFF":
                        text = "🔴 Le serveur IrisFA est actuellement : **Hors-ligne (OFF)**.";
                        break;
                    case "CRASH":
                        text = "🟠 Le serveur IrisFA vient de **Crash**. Le staff est au courant.";
                        break;
                    case "REBOOT":
                        text = "🔵 Le serveur IrisFA est en cours de **Redémarrage (REBOOT)**.";
                        break;
                }

                if (text) await channel.send(text);
            }

            data.lastStatus = currentStatus;
            fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
        }
    }
};