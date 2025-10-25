const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const memoryManager = require('../../core/memory/MemoryManager'); // Refatorado

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memoria')
        .setDescription('Ver estatísticas de memória do bot')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Ver memórias de um usuário específico')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        
        // Buscar dados de memória
        const activeContext = memoryManager.getActiveContext(targetUser.id);
        const memories = memoryManager.getMemories(targetUser.id, { limit: 5 });
        const topics = memoryManager.getRecentTopics(targetUser.id, 5);
        const history = memoryManager.getHistory(targetUser.id, 10);
        
        // Construir embed
        const embed = new EmbedBuilder()
            .setTitle(`🧠 Memória - ${targetUser.username}`)
            .setColor(activeContext ? 0x00ff00 : 0x808080)
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();
        
        // Contexto ativo
        const contextValue = activeContext 
            ? `✅ Sim (conversa ativa)\n📊 Mensagens no histórico: ${history.length}\n⏰ Última atualização: <t:${Math.floor(activeContext.lastUpdate / 1000)}:R>`
            : '❌ Não (sem contexto ativo)';
        
        embed.addFields({
            name: '⚡ Contexto Ativo',
            value: contextValue,
            inline: false
        });
        
        // Memórias salvas
        let memoriesValue = 'Nenhuma memória ainda';
        if (memories.length > 0) {
            memoriesValue = memories.map(m => {
                const content = m.content.length > 50 
                    ? m.content.substring(0, 50) + '...' 
                    : m.content;
                const score = (m.relevance_score * 100).toFixed(0);
                return `• **${m.memory_type}** (${score}%): ${content}`;
            }).join('\n');
        }
        
        embed.addFields({
            name: '📝 Memórias Salvas',
            value: memoriesValue,
            inline: false
        });
        
        // Tópicos recentes
        let topicsValue = 'Nenhum tópico registrado';
        if (topics.length > 0) {
            topicsValue = topics.map(t => {
                const sentiment = {
                    'positive': '😊',
                    'negative': '😔',
                    'neutral': '😐'
                }[t.sentiment] || '🤔';
                
                return `• **${t.topic}** ${sentiment} (${t.message_count} msgs)`;
            }).join('\n');
        }
        
        embed.addFields({
            name: '🗣️ Tópicos Recentes',
            value: topicsValue,
            inline: false
        });
        
        // Estatísticas gerais (apenas para o próprio usuário ou admins)
        if (targetUser.id === interaction.user.id || interaction.user.id === process.env.OWNER_ID) {
            const stats = memoryManager.getStats();
            
            const statsValue = [
                `💾 RAM: ${stats.ram.activeContexts} contextos, ${stats.ram.historyMessages} msgs`,
                `💿 SQLite: ${stats.sqlite.memories} memórias, ${stats.sqlite.topics} tópicos`
            ].join('\n');
            
            embed.addFields({
                name: '📊 Estatísticas Gerais',
                value: statsValue,
                inline: false
            });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

