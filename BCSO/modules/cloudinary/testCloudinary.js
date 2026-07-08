const cloudinary = require("./cloudinary");

module.exports = async () => {
    try {
        const result = await cloudinary.uploader.upload(
            "https://www.w3.org/Icons/w3c_home.png",
            {
                folder: "BCSO/test"
            }
        );

        console.log("✅ Image uploadée !");
        console.log(result.secure_url);

    } catch (error) {
        console.error("❌ Upload Cloudinary erreur :", error);
    }
};