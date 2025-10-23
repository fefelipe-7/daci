const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserPersonality = require('../../models/UserPersonality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('definir')
        .setDescription('(ADMIN) Configurar parâmetro de personalidade de um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para configurar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('parametro')
                .setDescription('Parâmetro a ser configurado')
                .setRequired(true)
                .addChoices(
                    { name: 'Extroversão', value: 'extroversao' },
                    { name: 'Sarcasmo', value: 'sarcasmo' },
                    { name: 'Sensibilidade', value: 'sensibilidade' },
                    { name: 'Liderança', value: 'lideranca' },
                    { name: 'Afinidade', value: 'afinidade' },
                    { name: 'Espontaneidade', value: 'espontaneidade' },
                    { name: 'Paciência', value: 'paciencia' },
                    { name: 'Criatividade', value: 'criatividade' },
                    { name: 'Humor Negro', value: 'humor_negro' },
                    { name: 'Empatia', value: 'empatia' },
                    { name: 'Zoeira Geral', value: 'zoeira_geral' },
                    { name: 'Lealdade', value: 'lealdade' },
                    { name: 'Dominância', value: 'dominancia' },
                    { name: 'Autoestima', value: 'autoestima' },
                    { name: 'Curiosidade', value: 'curiosidade' }
                ))
        .addNumberOption(option =>
            option.setName('valor')
                .setDescription('Valor do parâmetro (0.0 a 1.0)')
                .setRequired(true)
                .setMinValue(0.0)
                .setMaxValue(1.0))
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
        const parametro = interaction.options.getString('parametro');
        const valor = interaction.options.getNumber('valor');

        try {
            await interaction.deferReply();

            // Atualizar parâmetro
            const perfil = UserPersonality.setParameter(
                targetUser.id,
                interaction.guild.id,
                parametro,
                valor
            );

            // Atualizar username se necessário
            if (perfil.username === 'Unknown') {
                UserPersonality.update(targetUser.id, interaction.guild.id, { username: targetUser.username });
            }

            // Criar embed de confirmação
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Parâmetro Atualizado')
                .setDescription(`Parâmetro **${parametro}** de ${targetUser} foi atualizado!`)
                .addFields(
                    { name: 'Parâmetro', value: parametro, inline: true },
                    { name: 'Novo Valor', value: valor.toFixed(2), inline: true },
                    { name: 'Barra Visual', value: this.gerarBarra(valor), inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Configurado por ${interaction.user.username}` });

            await interaction.editReply({ embeds: [embed] });

            // Log
            console.log(`[PERSONALITY] ${interaction.user.username} definiu ${parametro}=${valor} para ${targetUser.username}`);

        } catch (error) {
            console.error('Erro ao definir parâmetro:', error);
            await interaction.editReply({
                content: '❌ Erro ao atualizar parâmetro!',
                flags: 64
            });
        }
    },

    // Helper para gerar barra visual
    gerarBarra(valor) {
        const total = 10;
        const preenchido = Math.round(valor * total);
        const vazio = total - preenchido;
        return '█'.repeat(preenchido) + '░'.repeat(vazio) + ` ${(valor * 100).toFixed(0)}%`;
    }
};

