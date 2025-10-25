/**
 * ShortTermMemory - Gerenciamento de memória volátil (RAM)
 * 
 * Responsável por:
 * - Contextos ativos (Map com TTL)
 * - Histórico de conversa temporário
 * - Cache de dados efêmeros
 */

const logger = require('../Logger');

class ShortTermMemory {
    constructor() {
        this.activeContexts = new Map(); // { userId: { data, expiresAt } }
        this.conversationHistory = new Map(); // { userId: [messages] }
        this.processingLocks = new Map(); // { userId: Promise }
        
        this.DEFAULT_TTL = 60 * 60 * 1000; // 1 hora
        this.MAX_HISTORY_SIZE = 20; // Máximo de mensagens no histórico
        
        logger.debug('memory', '🧠 ShortTermMemory inicializado');
    }
    
    /**
     * Obtém contexto ativo de um usuário
     */
    getActiveContext(userId) {
        const context = this.activeContexts.get(userId);
        
        // Verificar expiração
        if (context && context.expiresAt < Date.now()) {
            this.activeContexts.delete(userId);
            logger.debug('memory', `⏰ Contexto expirado para ${userId}`);
            return null;
        }
        
        return context ? context.data : null;
    }
    
    /**
     * Define contexto ativo para um usuário
     */
    setActiveContext(userId, data, ttl = this.DEFAULT_TTL) {
        this.activeContexts.set(userId, {
            data,
            expiresAt: Date.now() + ttl
        });
        
        logger.debug('memory', `💾 Contexto salvo para ${userId} (TTL: ${ttl}ms)`);
    }
    
    /**
     * Adiciona mensagem ao histórico temporário
     */
    addToHistory(userId, message) {
        let history = this.conversationHistory.get(userId);
        
        if (!history) {
            history = [];
            this.conversationHistory.set(userId, history);
        }
        
        // Adicionar mensagem enriquecida
        const enhancedMessage = {
            ...message,
            timestamp: Date.now()
        };
        
        history.push(enhancedMessage);
        
        // Limitar tamanho do histórico
        if (history.length > this.MAX_HISTORY_SIZE) {
            history.shift(); // Remove a mais antiga
        }
        
        return enhancedMessage;
    }
    
    /**
     * Obtém histórico de conversa
     */
    getHistory(userId, limit = 10) {
        const history = this.conversationHistory.get(userId) || [];
        return history.slice(-limit); // Retorna as N últimas
    }
    
    /**
     * Limpa contexto de um usuário
     */
    clearContext(userId) {
        this.activeContexts.delete(userId);
        logger.debug('memory', `🧹 Contexto limpo para ${userId}`);
    }
    
    /**
     * Limpa histórico de um usuário
     */
    clearHistory(userId) {
        this.conversationHistory.delete(userId);
        logger.debug('memory', `🧹 Histórico limpo para ${userId}`);
    }
    
    /**
     * Limpa contextos expirados
     */
    cleanupExpiredContexts() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [userId, context] of this.activeContexts.entries()) {
            if (context.expiresAt < now) {
                this.activeContexts.delete(userId);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            logger.info('memory', `🧹 Limpou ${cleaned} contextos expirados`);
        }
        
        return cleaned;
    }
    
    /**
     * Estatísticas da memória de curto prazo
     */
    getStats() {
        return {
            activeContexts: this.activeContexts.size,
            totalHistories: this.conversationHistory.size,
            totalMessages: Array.from(this.conversationHistory.values())
                .reduce((sum, hist) => sum + hist.length, 0)
        };
    }
}

module.exports = ShortTermMemory;

