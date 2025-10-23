const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Adiciona um aviso ao histórico do usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para receber o aviso')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do aviso')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({
                content: '❌ Usuário não encontrado no servidor!',
                ephemeral: true
            });
        }

        try {
            // Aqui você implementaria o sistema de warns no banco de dados
            // Por simplicidade, vamos apenas mostrar o embed
            
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Aviso Aplicado')
                .setColor(0xffa502)
                .addFields(
                    { name: 'Usuário', value: `${user.tag}`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `ID: ${user.id}` });

            await interaction.reply({ embeds: [embed] });

            // Log privado
            const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Erro no comando warn:', error);
            await interaction.reply({
                content: '❌ Erro ao aplicar aviso!',
                ephemeral: true
            });
        }
    }
};
