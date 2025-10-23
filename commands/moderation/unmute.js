const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove o silêncio de um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para remover o silêncio')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({
                content: '❌ Usuário não encontrado no servidor!',
                ephemeral: true
            });
        }

        if (!member.isCommunicationDisabled()) {
            return await interaction.reply({
                content: '❌ Este usuário não está silenciado!',
                ephemeral: true
            });
        }

        try {
            // Remover timeout
            await member.timeout(null);

            const embed = new EmbedBuilder()
                .setTitle('🔊 Silêncio Removido')
                .setColor(0x2ed573)
                .addFields(
                    { name: 'Usuário', value: `${user.tag}`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true }
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
            console.error('Erro no comando unmute:', error);
            await interaction.reply({
                content: '❌ Erro ao remover silêncio!',
                ephemeral: true
            });
        }
    }
};
