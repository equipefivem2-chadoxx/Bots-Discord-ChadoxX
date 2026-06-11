const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const dbPath = path.join(dataDir, 'customMessages.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // 1. Ouverture de la fenêtre
        if (interaction.isButton() && interaction.customId === 'btn_open_mscreate') {
            const modal = new ModalBuilder()
                .setCustomId('modal_mscreate')
                .setTitle('Nouveau message prédéfini');

            const cmdNameInput = new TextInputBuilder()
                .setCustomId('input_cmd_name')
                .setLabel('Nom de la commande (ex: !!test)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('!!exemple')
                .setRequired(true);

            const cmdTextInput = new TextInputBuilder()
                .setCustomId('input_cmd_text')
                .setLabel('Le message à envoyer au joueur')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(cmdNameInput),
                new ActionRowBuilder().addComponents(cmdTextInput)
            );

            await interaction.showModal(modal);
        }

        // 2. Validation et bouton grisé
        if (interaction.isModalSubmit() && interaction.customId === 'modal_mscreate') {
            let cmdName = interaction.fields.getTextInputValue('input_cmd_name').trim();
            const cmdText = interaction.fields.getTextInputValue('input_cmd_text');

            if (!cmdName.startsWith('!')) cmdName = '!!' + cmdName;

            const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            db[cmdName] = cmdText;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));

            // On répond au staff pour confirmer (Correction de l'avertissement ici ✨)
            await interaction.reply({ 
                content: `✅ La commande \`${cmdName}\` a été créée avec succès !`, 
                flags: MessageFlags.Ephemeral 
            });

            // ✨ NOUVEAU : On grise le bouton du message d'origine
            if (interaction.message) {
                const originalRow = interaction.message.components[0];
                const disabledButton = ButtonBuilder.from(originalRow.components[0]).setDisabled(true);
                const newRow = new ActionRowBuilder().addComponents(disabledButton);
                
                await interaction.message.edit({ components: [newRow] }).catch(() => {});
            }
        }
    }
};