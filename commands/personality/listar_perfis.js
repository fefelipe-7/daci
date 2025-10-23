const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserPersonality = require('../../models/UserPersonality');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listar_perfis')
        .setDescription('(ADMIN) Listar todos os perfis customizados do servidor')
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

        await interaction.deferReply();

        try {
            // Buscar apenas perfis customizados (não neutros)
            const perfis = UserPersonality.getCustomized(interaction.guild.id);

            if (perfis.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x808080)
                    .setTitle('📋 Perfis Customizados')
                    .setDescription('Nenhum perfil customizado encontrado neste servidor.')
                    .setFooter({ text: 'Use /definir para criar perfis personalizados' });

                return interaction.editReply({ embeds: [embed] });
            }

            // Criar embed com lista de perfis
            const embed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle('📋 Perfis Customizados')
                .setDescription(`**${perfis.length}** perfil(is) customizado(s) encontrado(s):`)
                .setTimestamp();

            // Adicionar campo para cada perfil (máximo 25 campos)
            const maxPerfis = Math.min(perfis.length, 25);
            for (let i = 0; i < maxPerfis; i++) {
                const perfil = perfis[i];
                
                // Encontrar parâmetros modificados (diferentes de 0.5)
                const modificados = [];
                const params = [
                    'extroversao', 'sarcasmo', 'sensibilidade', 'lideranca', 'afinidade',
                    'espontaneidade', 'paciencia', 'criatividade', 'humor_negro', 'empatia',
                    'zoeira_geral', 'lealdade', 'dominancia', 'autoestima', 'curiosidade'
                ];
                
                for (const param of params) {
                    if (Math.abs(perfil[param] - 0.5) > 0.01) {
                        const emoji = this.getParamEmoji(param);
                        modificados.push(`${emoji} ${(perfil[param] * 100).toFixed(0)}%`);
                    }
                }

                const modificadosStr = modificados.length > 0 
                    ? modificados.slice(0, 5).join(', ') + (modificados.length > 5 ? '...' : '')
                    : 'Nenhum';

                embed.addFields({
                    name: `👤 ${perfil.username || 'Unknown'}`,
                    value: `ID: \`${perfil.user_id}\`\n${modificadosStr}\nInterações: ${perfil.interaction_count}`,
                    inline: false
                });
            }

            if (perfis.length > 25) {
                embed.setFooter({ text: `Mostrando 25 de ${perfis.length} perfis` });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao listar perfis:', error);
            await interaction.editReply({
                content: '❌ Erro ao listar perfis customizados!',
                flags: 64
            });
        }
    },

    // Helper para obter emoji por parâmetro
    getParamEmoji(param) {
        const emojis = {
            extroversao: '🎭',
            sarcasmo: '😏',
            sensibilidade: '🌸',
            lideranca: '👑',
            afinidade: '💖',
            espontaneidade: '⚡',
            paciencia: '🧘',
            criatividade: '🎨',
            humor_negro: '🖤',
            empatia: '💝',
            zoeira_geral: '🎉',
            lealdade: '🤝',
            dominancia: '💪',
            autoestima: '✨',
            curiosidade: '🔍'
        };
        return emojis[param] || '•';
    }
};

