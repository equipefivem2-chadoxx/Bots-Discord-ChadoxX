module.exports = () => {
    console.log("CLOUD NAME =", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API KEY =", process.env.CLOUDINARY_API_KEY ? "OK" : "MANQUANT");
    console.log("SECRET =", process.env.CLOUDINARY_API_SECRET ? "OK" : "MANQUANT");
};