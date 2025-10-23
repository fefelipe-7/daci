const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ia_modelos')
        .setDescription('📋 Lista todos os modelos de IA disponíveis')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Filtrar por categoria')
                .addChoices(
                    { name: 'Confirmados', value: 'confirmed' },
                    { name: 'Em Teste', value: 'testing' },
                    { name: 'Todos', value: 'all' }
                )
        ),

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

            const categoria = interaction.options.getString('categoria') || 'all';
            let models = global.aiService.listAvailableModels();

            // Filtrar por categoria se necessário
            if (categoria !== 'all') {
                models = models.filter(m => m.category === categoria);
            }

            // Dividir em páginas (máximo 10 modelos por página)
            const modelsPerPage = 10;
            const totalPages = Math.ceil(models.length / modelsPerPage);
            const page = 0; // Primeira página

            const startIndex = page * modelsPerPage;
            const endIndex = startIndex + modelsPerPage;
            const pageModels = models.slice(startIndex, endIndex);

            // Criar embed
            const embed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🤖 Modelos de IA Disponíveis')
                .setDescription(`${models.length} modelos ${categoria !== 'all' ? `(${categoria})` : ''}`)
                .setFooter({ text: `Página ${page + 1}/${totalPages} | Use /ia_stats para estatísticas` })
                .setTimestamp();

            // Adicionar modelos
            pageModels.forEach((model, index) => {
                const status = model.isActive ? '🟢' : '🔴';
                const priority = model.priority <= 5 ? '⭐' : model.priority <= 10 ? '📌' : '📋';
                
                embed.addFields({
                    name: `${status} ${priority} ${model.name.split('/')[1]}`,
                    value: `${model.description}\n` +
                           `Prioridade: ${model.priority} | ` +
                           `Uso: ${model.usage} (${model.percentUsed})`,
                    inline: false
                });
            });

            // Adicionar legenda
            embed.addFields({
                name: '📖 Legenda',
                value: '🟢 Ativo | 🔴 Limite atingido\n' +
                       '⭐ Alta prioridade | 📌 Média | 📋 Baixa\n' +
                       `**Categoria:** ${categoria === 'all' ? 'Todas' : categoria}`,
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro no comando ia_modelos:', error);
            await interaction.editReply({
                content: `❌ Erro ao listar modelos: ${error.message}`
            });
        }
    }
};

