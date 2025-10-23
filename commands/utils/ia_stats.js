const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ia_stats')
        .setDescription('📊 Mostra estatísticas do serviço de IA'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Verificar se IA está disponível
            if (!global.aiService) {
                return await interaction.editReply({
                    content: '⚠️ Serviço de IA não inicializado.\n\n' +
                             'O bot precisa ser reiniciado com OPENROUTE_KEY configurada.'
                });
            }

            const stats = global.aiService.getStats();

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📊 Estatísticas do Serviço de IA')
                .setDescription('Status e uso dos modelos OpenRouter')
                .addFields(
                    {
                        name: '🤖 Requisições de IA',
                        value: `Total: ${stats.ai.totalRequests}\n` +
                               `Sucesso: ${stats.ai.successful}\n` +
                               `Falhas: ${stats.ai.failed}\n` +
                               `Taxa de Sucesso: ${stats.ai.successRate}`,
                        inline: true
                    },
                    {
                        name: '⏱️ Performance',
                        value: `Tempo Médio: ${stats.ai.avgResponseTime}\n` +
                               `\u200B`,
                        inline: true
                    },
                    {
                        name: '📦 Modelos',
                        value: `Total: ${stats.models.totalModels}\n` +
                               `Ativos: ${stats.models.activeModels}\n` +
                               `Requisições: ${stats.models.totalRequests}`,
                        inline: false
                    },
                    {
                        name: '🏆 Top 5 Modelos Mais Usados',
                        value: stats.models.topUsed.map((m, i) => 
                            `${i + 1}. **${m.name}**: ${m.used}/${m.limit}`
                        ).join('\n') || 'Nenhum uso ainda',
                        inline: false
                    },
                    {
                        name: '📁 Categorias',
                        value: `Confirmados: ${stats.models.byCategory.confirmed}\n` +
                               `Em Teste: ${stats.models.byCategory.testing}`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Use /ia_modelos para ver todos os modelos' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro no comando ia_stats:', error);
            await interaction.editReply({
                content: `❌ Erro ao buscar estatísticas: ${error.message}`
            });
        }
    }
};

