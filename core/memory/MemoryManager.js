/**
 * MemoryManager - Sistema híbrido de memória (RAM + SQLite) - REFATORADO
 * 
 * Orquestrador que delega operações para módulos especializados:
 * - ShortTermMemory: Contexto ativo e histórico temporário (RAM)
 * - LongTermMemory: Memórias consolidadas (SQLite)
 * - MemoryConsolidator: Consolidação RAM → SQLite
 * - TopicExtractor: Extração de tópicos e relevância
 * - MemoryCleaner: Limpeza e esquecimento ativo
 * 
 * Mantém API pública idêntica para compatibilidade total
 */

const logger = require('../Logger');
const ShortTermMemory = require('./ShortTermMemory');
const LongTermMemory = require('./LongTermMemory');
const MemoryConsolidator = require('./MemoryConsolidator');
const TopicExtractor = require('./TopicExtractor');
const MemoryCleaner = require('./MemoryCleaner');

// Sistemas de contexto inteligente (externos)
const ContextTracker = require('../ContextTracker');
const EntityRecognizer = require('../EntityRecognizer');
const ConversationThreading = require('../ConversationThreading');

class MemoryManager {
    constructor() {
        // ===== INICIALIZAR MÓDULOS =====
        this.shortTerm = new ShortTermMemory();
        this.longTerm = new LongTermMemory();
        this.topicExtractor = new TopicExtractor();
        this.consolidator = new MemoryConsolidator(this.shortTerm, this.longTerm, this.topicExtractor);
        this.cleaner = new MemoryCleaner(this.shortTerm, this.longTerm);
        
        // ===== SISTEMAS DE CONTEXTO INTELIGENTE =====
        this.contextTracker = new ContextTracker();
        this.entityRecognizer = new EntityRecognizer();
        this.conversationThreading = new ConversationThreading();
        
        // ===== INICIAR LIMPEZA AUTOMÁTICA =====
        this.cleaner.startCleanupTimer();
        this.cleaner.startDailyForgetting();
        
        logger.info('memory', '🧠 MemoryManager inicializado (arquitetura modular)');
    }
    
    // ========================================================================
    // API PÚBLICA - CONTEXTO ATIVO (DELEGAÇÃO)
    // ========================================================================
    
    /**
     * Obter contexto ativo de um usuário
     */
    getActiveContext(userId) {
        // Usar ContextTracker para obter estado inteligente
        const trackerState = this.contextTracker.getActiveState(userId);
        const threadSummary = this.conversationThreading.getThreadSummary(userId);
        
        // Fallback para sistema antigo se ContextTracker não tem dados
        if (!trackerState) {
            return this.shortTerm.getActiveContext(userId);
        }
        
        // Retornar contexto enriquecido com threading
        return {
            ...trackerState,
            thread: threadSummary,
            lastTopics: this.longTerm.getRecentTopics(userId, 5)
        };
    }
    
    /**
     * Definir/atualizar contexto ativo
     */
    setActiveContext(userId, data, ttl) {
        this.shortTerm.setActiveContext(userId, data, ttl);
    }
    
    /**
     * Adicionar mensagem ao histórico de conversa
     * (MÉTODO PRINCIPAL com integração de contexto inteligente)
     */
    addToHistory(userId, message, guildId = null) {
        // Adicionar à memória de curto prazo
        const enhancedMessage = this.shortTerm.addToHistory(userId, message);
        
        // NOVO: Extrair entidades da mensagem em tempo real
        if (message.role === 'user' && message.content) {
            const entities = this.entityRecognizer.extractEntities(message.content, userId);
            enhancedMessage.entities = entities;
            
            // Atualizar ContextTracker com entidades detectadas
            if (this.entityRecognizer.hasSignificantEntities(entities)) {
                const topico = this.topicExtractor.inferTopic(entities, message.content);
                this.contextTracker.updateContext(userId, {
                    entidades_ativas: entities,
                    topico_ativo: topico,
                    ultimo_assunto: message.content.substring(0, 100)
                });
            }
        }
        
        // NOVO: Atualizar threading se temos user + bot messages
        if (message.role === 'bot') {
            const history = this.shortTerm.getHistory(userId);
            const userMessages = history.filter(m => m.role === 'user');
            const lastUserMsg = userMessages[userMessages.length - 1];
            
            if (lastUserMsg) {
                this.conversationThreading.addTurn(
                    userId,
                    lastUserMsg.content,
                    message.content,
                    { topic: this.contextTracker.getActiveState(userId)?.topico_ativo }
                );
            }
        }
        
        // Consolidar se necessário
        this.consolidator.consolidateIfNeeded(userId, guildId);
    }
    
    /**
     * Obter histórico de conversa
     */
    getHistory(userId, limit = 10) {
        return this.shortTerm.getHistory(userId, limit);
    }
    
    /**
     * Limpar contexto de um usuário
     */
    clearContext(userId) {
        this.shortTerm.clearContext(userId);
        this.shortTerm.clearHistory(userId);
        this.contextTracker.clearContext(userId);
    }
    
    // ========================================================================
    // API PÚBLICA - MEMÓRIAS DE LONGO PRAZO (DELEGAÇÃO)
    // ========================================================================
    
    /**
     * Salvar memória permanente
     */
    saveMemory(options) {
        const {
            userId,
            guildId = null,
            type,
            content,
            relevance = null,
            metadata = {}
        } = options;
        
        // Calcular relevância automaticamente se não fornecida
        const finalRelevance = relevance || this.topicExtractor.calculateRelevance(content, type, metadata);
        
        this.longTerm.saveMemory({
            userId,
            guildId,
            type,
            content,
            relevance: finalRelevance,
            metadata
        });
    }
    
    /**
     * Buscar memórias de um usuário
     */
    getMemories(userId, filters = {}) {
        return this.longTerm.getMemories(userId, filters);
    }
    
    /**
     * Buscar tópicos de conversa recentes
     */
    getRecentTopics(userId, limit = 5) {
        return this.longTerm.getRecentTopics(userId, limit);
    }
    
    // ========================================================================
    // MÉTODOS UTILITÁRIOS
    // ========================================================================
    
    /**
     * Estatísticas gerais do sistema de memória
     */
    getStats() {
        const shortTermStats = this.shortTerm.getStats();
        const longTermStats = this.longTerm.getStats();
        
        return {
            shortTerm: shortTermStats,
            longTerm: longTermStats,
            total: {
                activeContexts: shortTermStats.activeContexts,
                totalHistories: shortTermStats.totalHistories,
                totalMessages: shortTermStats.totalMessages,
                totalMemories: longTermStats.totalMemories,
                totalTopics: longTermStats.totalTopics,
                uniqueUsers: longTermStats.uniqueUsers
            }
        };
    }
    
    /**
     * Shutdown gracioso (salvar tudo antes de fechar)
     */
    async shutdown() {
        logger.info('memory', '🛑 Desligando MemoryManager...');
        
        try {
            // Consolidar todas as memórias pendentes
            for (const userId of this.shortTerm.conversationHistory.keys()) {
                this.consolidator.consolidateIfNeeded(userId);
            }
            
            // Fechar banco de dados
            this.longTerm.close();
            
            logger.success('memory', '✅ MemoryManager desligado com sucesso');
        } catch (error) {
            logger.error('memory', `Erro ao desligar: ${error.message}`);
        }
    }
}

module.exports = new MemoryManager();

