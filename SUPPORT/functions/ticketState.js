// Mémoire vive pour stocker les minuteurs et les alertes de tickets
module.exports = {
    timers: new Map(), // Stocke les compte à rebours de fermeture
    alerts: new Map()  // Stocke les staffs à alerter (ID du salon -> Set des IDs staff)
};