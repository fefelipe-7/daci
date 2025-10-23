const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um membro do servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário a ser banido')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do banimento')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('dias')
                .setDescription('Número de dias para deletar mensagens (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';
        const deleteMessageDays = interaction.options.getInteger('dias') || 0;
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({
                content: '❌ Usuário não encontrado no servidor!',
                ephemeral: true
            });
        }

        if (!member.bannable) {
            return await interaction.reply({
                content: '❌ Não posso banir este usuário!',
                ephemeral: true
            });
        }

        try {
            await member.ban({ 
                reason: reason,
                deleteMessageDays: deleteMessageDays
            });
            
            const embed = {
                color: 0xff4757,
                title: '🔨 Usuário Banido',
                fields: [
                    { name: 'Usuário', value: `${user.tag}`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Motivo', value: reason, inline: false },
                    { name: 'Mensagens deletadas', value: `${deleteMessageDays} dias`, inline: true }
                ],
                timestamp: new Date().toISOString(),
                footer: { text: `ID: ${user.id}` }
            };

            await interaction.reply({ embeds: [embed] });

            // Log privado
            const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Erro ao banir usuário:', error);
            await interaction.reply({
                content: '❌ Erro ao banir o usuário!',
                ephemeral: true
            });
        }
    }
};
