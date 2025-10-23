const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AIService = require('../../core/AIService.js');
const { getUserPersonality } = require('../../models/UserPersonality.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teste_ia')
        .setDescription('🧪 Testa o serviço de IA com sua personalidade')
        .addStringOption(option =>
            option.setName('mensagem')
                .setDescription('Mensagem para testar a IA')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Verificar se OPENROUTE_KEY está configurada
            if (!process.env.OPENROUTE_KEY) {
                return await interaction.editReply({
                    content: '❌ OPENROUTE_KEY não configurada no .env\n\n' +
                             'Configure a chave da API OpenRouter nas variáveis de ambiente.'
                });
            }

            // Inicializar AI Service
            const aiService = new AIService(process.env.OPENROUTE_KEY);

            // Obter mensagem
            const mensagem = interaction.options.getString('mensagem');

            // Carregar perfil do usuário
            const userProfile = getUserPersonality(interaction.user.id);

            // Gerar resposta
            const startTime = Date.now();
            const response = await aiService.generateResponse(
                mensagem,
                userProfile,
                {
                    channelType: interaction.channel.type,
                    username: interaction.user.username
                }
            );
            const responseTime = Date.now() - startTime;

            // Criar embed com resultado
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🤖 Teste de IA - DACI Bot')
                .setDescription('Resposta gerada com sucesso!')
                .addFields(
                    {
                        name: '📨 Sua Mensagem',
                        value: `\`\`\`${mensagem}\`\`\``,
                        inline: false
                    },
                    {
                        name: '🤖 Resposta da IA',
                        value: `\`\`\`${response}\`\`\``,
                        inline: false
                    },
                    {
                        name: '👤 Seu Perfil',
                        value: userProfile 
                            ? `${userProfile.apelido || userProfile.username}\n` +
                              `Afinidade: ${userProfile.parametros?.afinidade || 0.5}`
                            : 'Perfil padrão',
                        inline: true
                    },
                    {
                        name: '⏱️ Tempo de Resposta',
                        value: `${responseTime}ms`,
                        inline: true
                    },
                    {
                        name: '📊 Estatísticas',
                        value: `Modelo usado: ${aiService.modelManager.selectBestModel().name.split('/')[1]}`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Sistema de IA com OpenRouter' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro no comando teste_ia:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro no Teste de IA')
                .setDescription('Ocorreu um erro ao tentar gerar resposta.')
                .addFields(
                    {
                        name: 'Erro',
                        value: `\`\`\`${error.message}\`\`\``,
                        inline: false
                    },
                    {
                        name: '💡 Possíveis Soluções',
                        value: '• Verifique se OPENROUTE_KEY está configurada\n' +
                               '• Confirme se a chave é válida\n' +
                               '• Verifique sua conexão com a internet\n' +
                               '• Veja se os modelos estão disponíveis',
                        inline: false
                    }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

