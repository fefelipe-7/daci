const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teste_ia')
        .setDescription('🧪 [ADMIN] Testa conexão com OpenRouter API')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Verificar se AI Service está disponível
            if (!global.aiService) {
                return await interaction.editReply({
                    content: '⚠️ **Serviço de IA não inicializado**\n\n' +
                             '**Motivo:** OPENROUTE_KEY não configurada no .env\n\n' +
                             '**Como configurar:**\n' +
                             '1. Obtenha chave em: https://openrouter.ai/\n' +
                             '2. Adicione `OPENROUTE_KEY=sk-or-v1-...` no .env\n' +
                             '3. Reinicie o bot'
                });
            }

            // Testar conexão
            console.log('🧪 [ADMIN] Testando conexão com OpenRouter...');
            const startTime = Date.now();
            const testResult = await global.aiService.testConnection();
            const responseTime = Date.now() - startTime;

            if (testResult.success) {
                const stats = global.aiService.getStats();
                
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Teste de IA - Conexão OK')
                    .setDescription('Serviço de IA está funcionando corretamente!')
                    .addFields(
                        {
                            name: '🔗 Status da Conexão',
                            value: '✅ Conectado ao OpenRouter',
                            inline: false
                        },
                        {
                            name: '🤖 Modelo de Teste',
                            value: `\`${testResult.model.split('/')[1]}\``,
                            inline: true
                        },
                        {
                            name: '⏱️ Tempo de Resposta',
                            value: `${responseTime}ms`,
                            inline: true
                        },
                        {
                            name: '📊 Estatísticas de Uso',
                            value: `Total: ${stats.ai.totalRequests} requisições\n` +
                                   `Sucesso: ${stats.ai.successRate}\n` +
                                   `Tempo médio: ${stats.ai.avgResponseTime}`,
                            inline: false
                        },
                        {
                            name: '🎯 Como Usar',
                            value: '**Para conversar com IA:**\n' +
                                   '• Mencione o bot: `@DACI oi, como vai?`\n' +
                                   '• Responda mensagens dele\n\n' +
                                   '**Comandos admin:**\n' +
                                   '• `/ia_stats` - Ver estatísticas\n' +
                                   '• `/ia_modelos` - Listar modelos',
                            inline: false
                        }
                    )
                    .setFooter({ text: 'A IA é usada apenas em menções e respostas, não em comandos slash' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Teste de IA - Conexão Falhou')
                    .setDescription('Erro ao conectar com OpenRouter')
                    .addFields(
                        {
                            name: '❌ Erro',
                            value: `\`\`\`${testResult.error}\`\`\``,
                            inline: false
                        },
                        {
                            name: '💡 Possíveis Soluções',
                            value: '• Verifique se OPENROUTE_KEY está correta\n' +
                                   '• Confirme se a chave é válida em https://openrouter.ai/\n' +
                                   '• Verifique conexão com internet\n' +
                                   '• Veja se os modelos estão disponíveis',
                            inline: false
                        }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [errorEmbed] });
            }

        } catch (error) {
            console.error('[ADMIN] Erro no comando teste_ia:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro no Teste de IA')
                .setDescription('Ocorreu um erro ao tentar testar a conexão.')
                .addFields(
                    {
                        name: 'Erro',
                        value: `\`\`\`${error.message}\`\`\``,
                        inline: false
                    }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

