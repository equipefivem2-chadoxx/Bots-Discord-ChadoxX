const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ✨ FIX : Utilisation du port de ton allocation principale Now-Heberg
// process.env.SERVER_PORT permet au panel d'injecter le port tout seul, avec 25638 en sécurité
const PORT = process.env.SERVER_PORT || 25638; 

// Permet à Netlify de lire les données du bot sans être bloqué
app.use(cors());

app.get('/api/status', (req, res) => {
    const statusPath = path.join(__dirname, 'status.json');
    try {
        if (fs.existsSync(statusPath)) {
            const data = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
            res.json(data);
        } else {
            res.json({ isOpen: false });
        }
    } catch (error) {
        res.json({ isOpen: false });
    }
});

module.exports = {
    init: () => {
        app.listen(PORT, () => {
            console.log(`🌐 [API SASP] Pont Web activé sur le port ${PORT}`);
        });
    }
};