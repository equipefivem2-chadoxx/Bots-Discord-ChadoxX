const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'embeedhistoire', // Avec les deux "e" comme demandé
    description: 'Envoie l\'histoire de San Andreas en format Embed officiel',

    async execute(message, args, client) {
        const channelId = '1487837975831249077';
        const targetChannel = await client.channels.fetch(channelId).catch(() => null);

        if (!targetChannel) {
            return message.reply("❌ Impossible de trouver le salon. Vérifie l'ID.");
        }

        // Création de l'Embed avec la nouvelle couleur officielle
        const histoireEmbed = new EmbedBuilder()
            .setColor('#1D3557') // ✨ Un Bleu Nuit très élégant et gouvernemental
            .setTitle('🏛️ CHRONIQUES DE L’ÉTAT DE SAN ANDREAS')
            .setDescription(
                `**Devise : “Par l’unité, la stabilité”**\n\n` +
                `L’histoire de l’État de San Andreas débute au début du XXe siècle, à une époque où le territoire n’était encore qu’une région en plein développement, marquée par une forte instabilité sociale et politique. Entre 1905 et 1920, l’afflux massif de population, attirée par les opportunités économiques, entraîne une urbanisation rapide et désorganisée, notamment dans la zone de Los Santos.\n\n` +
                `Dans les années 1920, les premières institutions gouvernementales structurées voient le jour. Toutefois, l’autorité de l’État reste limitée, et plusieurs zones échappent encore au contrôle des pouvoirs publics. Cette période est marquée par une montée de la criminalité et l’émergence de groupes organisés influents.\n\n` +
                `La crise économique des années 1930 fragilise davantage San Andreas. Entre 1930 et 1938, l’État met en place ses premières politiques sociales afin de soutenir une population durement touchée. Ces réformes marquent un tournant dans l’implication du gouvernement dans la vie économique et sociale.\n\n` +
                `À partir de 1945, à la suite de la fin de la Seconde Guerre mondiale, San Andreas connaît une phase de reconstruction et de modernisation. Entre 1950 et 1965, les infrastructures publiques se développent rapidement, accompagnées d’un renforcement des institutions judiciaires et des forces de l’ordre. Cette période est souvent considérée comme la fondation du San Andreas moderne.\n\n` +
                `Les années 1970 et 1980 sont marquées par une forte croissance démographique et économique. Los Santos devient progressivement un centre urbain majeur, tandis que des zones comme Blaine County et Paleto Bay se développent en parallèle. Cependant, cette expansion rapide entraîne également des inégalités territoriales et une augmentation des tensions sociales.\n\n` +
                `Entre 1990 et 2005, San Andreas traverse une période plus instable. Plusieurs crises économiques successives, combinées à une montée de la corruption et de l’influence des organisations criminelles, mettent à l’épreuve les institutions de l’État. En réponse, d’importantes réformes sont engagées afin de restaurer l’autorité gouvernementale et de renforcer la sécurité intérieure.\n\n` +
                `Depuis 2010, l’État de San Andreas s’inscrit dans une dynamique de modernisation et de stabilisation. Les institutions ont été consolidées, les politiques publiques renforcées, et les efforts en matière de sécurité ont permis de mieux encadrer les activités illégales.\n\n` +
                `Aujourd’hui, en 2026, San Andreas est un État structuré, puissant et en constante évolution. Malgré les défis persistants, il repose sur des institutions solides et une volonté affirmée de maintenir l’ordre, la justice et la stabilité sur l’ensemble de son territoire.\n\n` +
                `*L’histoire de San Andreas continue de s’écrire, portée par ses dirigeants, ses institutions et ses citoyens.*`
            )
            .setFooter({ 
                text: 'Gouvernement de San Andreas • Histoire Officielle', 
                iconURL: client.user.displayAvatarURL() 
            });

        await targetChannel.send({ embeds: [histoireEmbed] });
        await message.delete().catch(() => null);
        
        const confirmation = await message.channel.send(`✅ L'histoire a bien été postée dans <#${channelId}> !`);
        setTimeout(() => confirmation.delete().catch(() => null), 5000);
    }
};