const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const UserPersonality = require('../../models/UserPersonality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetar')
        .setDescription('(ADMIN) Resetar perfil de personalidade de um usuário para valores neutros')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para resetar perfil')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Verificar se é owner
        const ownerId = process.env.OWNER_ID;
        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: '❌ Apenas o dono do bot pode usar este comando!',
                flags: 64
            });
        }

        const targetUser = interaction.options.getUser('usuario');

        // Criar botões de confirmação
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`reset_confirm_${targetUser.id}`)
                    .setLabel('✅ Confirmar Reset')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`reset_cancel_${targetUser.id}`)
                    .setLabel('❌ Cancelar')
                    .setStyle(ButtonStyle.Secondary)
            );

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚠️ Confirmar Reset de Perfil')
            .setDescription(`Você tem certeza que deseja resetar o perfil de **${targetUser.username}**?`)
            .addFields(
                { name: 'Ação', value: 'Todos os parâmetros voltarão para 0.5 (neutro)' },
                { name: 'Usuário', value: targetUser.toString() }
            )
            .setFooter({ text: 'Esta ação não pode ser desfeita!' });

        await interaction.reply({ embeds: [embed], components: [row] });

        // Aguardar confirmação
        const filter = i => {
            return i.customId.startsWith('reset_') && i.user.id === interaction.user.id;
        };

        const collector = interaction.channel.createMessageComponentCollector({ 
            filter, 
            time: 30000,
            max: 1
        });

        collector.on('collect', async i => {
            if (i.customId.startsWith('reset_confirm_')) {
                try {
                    // Resetar perfil
                    UserPersonality.delete(targetUser.id, interaction.guild.id);

                    const successEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('✅ Perfil Resetado')
                        .setDescription(`O perfil de **${targetUser.username}** foi resetado para valores neutros (0.5)!`)
                        .setTimestamp()
                        .setFooter({ text: `Resetado por ${interaction.user.username}` });

                    await i.update({ embeds: [successEmbed], components: [] });

                    // Log
                    console.log(`[PERSONALITY] ${interaction.user.username} resetou o perfil de ${targetUser.username}`);

                } catch (error) {
                    console.error('Erro ao resetar perfil:', error);
                    await i.update({
                        content: '❌ Erro ao resetar perfil!',
                        embeds: [],
                        components: []
                    });
                }
            } else {
                const cancelEmbed = new EmbedBuilder()
                    .setColor(0x808080)
                    .setTitle('❌ Operação Cancelada')
                    .setDescription('O reset do perfil foi cancelado.');

                await i.update({ embeds: [cancelEmbed], components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0x808080)
                    .setTitle('⏱️ Tempo Esgotado')
                    .setDescription('O tempo para confirmação expirou.');

                interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
        });
    }
};

