const cloudinary = require("./cloudinary");

module.exports = () => {
    cloudinary.api.ping()
        .then(() => {
            console.log("✅ Cloudinary connecté !");
        })
        .catch((error) => {
            console.error("❌ Erreur Cloudinary :", error);
        });
};