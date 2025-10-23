const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpa mensagens do canal')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Número de mensagens para deletar (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Limpar mensagens de um usuário específico')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('quantidade');
        const targetUser = interaction.options.getUser('usuario');

        if (amount < 1 || amount > 100) {
            return await interaction.reply({
                content: '❌ A quantidade deve estar entre 1 e 100!',
                ephemeral: true
            });
        }

        try {
            let deletedCount = 0;
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            
            const messagesToDelete = messages.filter(msg => {
                if (targetUser && msg.author.id !== targetUser.id) return false;
                if (msg.createdTimestamp < Date.now() - 1209600000) return false; // 14 dias
                return true;
            }).first(amount);

            if (messagesToDelete.length === 0) {
                return await interaction.reply({
                    content: '❌ Nenhuma mensagem encontrada para deletar!',
                    ephemeral: true
                });
            }

            if (messagesToDelete.length === 1) {
                await messagesToDelete[0].delete();
                deletedCount = 1;
            } else {
                await interaction.channel.bulkDelete(messagesToDelete);
                deletedCount = messagesToDelete.length;
            }

            const embed = {
                color: 0x2ed573,
                title: '🧹 Mensagens Limpas',
                fields: [
                    { name: 'Quantidade', value: `${deletedCount} mensagens`, inline: true },
                    { name: 'Canal', value: `${interaction.channel}`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true }
                ],
                timestamp: new Date().toISOString()
            };

            if (targetUser) {
                embed.fields.push({ name: 'Filtro', value: `Apenas mensagens de ${targetUser.tag}`, inline: false });
            }

            const reply = await interaction.reply({ 
                content: `✅ ${deletedCount} mensagem(ns) deletada(s)!`,
                ephemeral: true 
            });

            // Log privado
            const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

            // Deletar mensagem de confirmação após 5 segundos
            setTimeout(async () => {
                try {
                    await reply.delete();
                } catch (error) {
                    console.error('Erro ao deletar mensagem de confirmação:', error);
                }
            }, 5000);

        } catch (error) {
            console.error('Erro ao limpar mensagens:', error);
            await interaction.reply({
                content: '❌ Erro ao limpar as mensagens!',
                ephemeral: true
            });
        }
    }
};
