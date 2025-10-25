/**
 * MemoryConsolidator - Consolidação de memória RAM → SQLite
 * 
 * Responsável por:
 * - Consolidar histórico temporário em memórias permanentes
 * - Prevenir race conditions com locks
 * - Limpar histórico consolidado
 */

const logger = require('../Logger');

class MemoryConsolidator {
    constructor(shortTermMemory, longTermMemory, topicExtractor) {
        this.shortTerm = shortTermMemory;
        this.longTerm = longTermMemory;
        this.topicExtractor = topicExtractor;
        
        this.consolidationLocks = new Map(); // { userId: boolean }
        this.CONSOLIDATION_THRESHOLD = 5; // Consolidar após N mensagens
        
        logger.debug('memory', '🔄 MemoryConsolidator inicializado');
    }
    
    /**
     * Consolida memória se necessário
     */
    consolidateIfNeeded(userId, guildId = null) {
        const history = this.shortTerm.conversationHistory.get(userId);
        
        if (!history || history.length < this.CONSOLIDATION_THRESHOLD) {
            return;
        }
        
        // LOCK: Prevenir consolidações simultâneas do mesmo usuário
        if (this.consolidationLocks.get(userId)) {
            logger.debug('memory', `Consolidação já em andamento para user ${userId}`);
            return;
        }
        
        this.consolidationLocks.set(userId, true);
        
        try {
            // Extrair tópicos mencionados
            const topics = this.topicExtractor.extractTopics(history);
            
            // Detectar sentimento geral
            const sentiment = this.topicExtractor.detectSentiment(history);
            
            // Salvar no SQLite
            if (topics.length > 0) {
                const startTime = history[0].timestamp;
                const endTime = history[history.length - 1].timestamp;
                
                topics.forEach(topic => {
                    this.longTerm.saveTopic(
                        userId,
                        guildId,
                        topic,
                        sentiment,
                        history.length,
                        startTime,
                        endTime,
                        null // summary - futuro
                    );
                });
                
                logger.success('memory', `Consolidado ${topics.length} tópicos para user ${userId}`);
            }
            
            // Limpar histórico antigo (manter últimas 5)
            const toKeep = history.slice(-5);
            this.shortTerm.conversationHistory.set(userId, toKeep);
            
        } catch (error) {
            logger.error('memory', `Erro ao consolidar memória: ${error.message}`);
        } finally {
            // UNLOCK: Liberar lock de consolidação
            this.consolidationLocks.set(userId, false);
        }
    }
    
    /**
     * Salva uma memória específica (preferências, fatos, etc)
     */
    saveMemory(userId, guildId, type, content, metadata = {}) {
        const relevance = this.topicExtractor.calculateRelevance(content, type, metadata);
        
        this.longTerm.saveMemory({
            userId,
            guildId,
            type,
            content,
            relevance,
            metadata
        });
    }
}

module.exports = MemoryConsolidator;

