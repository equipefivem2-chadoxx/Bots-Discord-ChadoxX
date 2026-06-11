// src/events/repModalHandler.js

const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        
        // --- SÉCURITÉ : VÉRIFICATION DU RÔLE ---
        const roleRequiredId = '1502295098560352509'; 
        
        // Si la personne n'a pas le rôle, on bloque tout de suite avec un message d'erreur invisible
        if (!interaction.member.roles.cache.has(roleRequiredId)) {
            if (interaction.isButton() || interaction.isModalSubmit()) {
                if (interaction.customId === 'btn_open_rep_modal' || interaction.customId === 'modal_rep') {
                    return interaction.reply({ 
                        content: "❌ Tu n'as pas la permission d'utiliser cet outil.", 
                        ephemeral: true 
                    });
                }
            }
            return;
        }
        
        // 1. OUVERTURE DE LA FENÊTRE
        if (interaction.isButton() && interaction.customId === 'btn_open_rep_modal') {
            
            const modal = new ModalBuilder()
                .setCustomId('modal_rep')
                .setTitle('Envoyer ou Répondre');

            const chanIdInput = new TextInputBuilder()
                .setCustomId('chanId')
                .setLabel("ID du salon de destination")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: 1502295369021788230")
                .setRequired(true);

            const msgIdInput = new TextInputBuilder()
                .setCustomId('msgId')
                .setLabel("ID du msg à répondre (Vide = msg normal)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const textInput = new TextInputBuilder()
                .setCustomId('repText')
                .setLabel("Ton message")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const pingInput = new TextInputBuilder()
                .setCustomId('pingId')
                .setLabel("ID de la personne à ping (Optionnel)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(chanIdInput),
                new ActionRowBuilder().addComponents(msgIdInput),
                new ActionRowBuilder().addComponents(textInput),
                new ActionRowBuilder().addComponents(pingInput)
            );

            await interaction.showModal(modal);
            interaction.message.delete().catch(() => {});
        }

        // 2. ENVOI DU MESSAGE OU DE LA RÉPONSE
        if (interaction.isModalSubmit() && interaction.customId === 'modal_rep') {
            
            const chanId = interaction.fields.getTextInputValue('chanId');
            const msgId = interaction.fields.getTextInputValue('msgId'); 
            let repText = interaction.fields.getTextInputValue('repText');
            const pingId = interaction.fields.getTextInputValue('pingId'); 

            if (pingId) {
                repText = `<@${pingId}> ${repText}`;
            }

            try {
                const targetChannel = await interaction.guild.channels.fetch(chanId);
                
                if (!targetChannel || !targetChannel.isTextBased()) {
                    return interaction.reply({ content: "❌ ID de salon invalide.", ephemeral: true });
                }

                if (msgId && msgId.trim() !== '') {
                    const targetMessage = await targetChannel.messages.fetch(msgId.trim());
                    
                    await targetMessage.reply({
                        content: repText,
                        allowedMentions: { repliedUser: true }
                    });
                } 
                else {
                    await targetChannel.send({ content: repText });
                }

                await interaction.reply({ content: '✅ Action effectuée avec succès !', ephemeral: true });

            } catch (error) {
                console.error("Erreur lors de l'action distante :", error);
                await interaction.reply({ 
                    content: "❌ Erreur : Impossible d'envoyer le message. Vérifie bien les ID fournis.", 
                    ephemeral: true 
                });
            }
        }
    },
};