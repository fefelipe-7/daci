/**
 * MemoryCleaner - Sistema de limpeza e esquecimento ativo
 * 
 * Responsável por:
 * - Limpar contextos expirados (RAM)
 * - Esquecimento ativo diário (SQLite)
 * - Remover memórias antigas com baixa relevância
 * - Timers automáticos
 */

const logger = require('../Logger');

class MemoryCleaner {
    constructor(shortTermMemory, longTermMemory) {
        this.shortTerm = shortTermMemory;
        this.longTerm = longTermMemory;
        
        // Configurações de esquecimento
        this.MEMORY_RETENTION_DAYS = 90; // Memórias antigas
        this.MIN_RELEVANCE = 0.3; // Mínimo para manter
        this.TOPIC_RETENTION_DAYS = 30; // Tópicos
        
        logger.debug('memory', '🧹 MemoryCleaner inicializado');
    }
    
    /**
     * Inicia timer de limpeza automática (a cada 5 minutos)
     */
    startCleanupTimer() {
        setInterval(() => {
            this.cleanupExpiredContexts();
        }, 5 * 60 * 1000);
        
        logger.info('memory', '⏰ Timer de limpeza iniciado (5 min)');
    }
    
    /**
     * Inicia sistema de esquecimento ativo (1x por dia à meia-noite)
     */
    startDailyForgetting() {
        const now = new Date();
        const night = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1, // Próximo dia
            0, 0, 0 // Meia-noite
        );
        
        const msUntilMidnight = night.getTime() - now.getTime();
        
        // Executar à meia-noite e depois a cada 24h
        setTimeout(() => {
            this.performDailyForgetting();
            
            // Repetir a cada 24 horas
            setInterval(() => {
                this.performDailyForgetting();
            }, 24 * 60 * 60 * 1000);
            
        }, msUntilMidnight);
        
        logger.info('memory', `🌙 Esquecimento ativo agendado para meia-noite (em ${Math.floor(msUntilMidnight / 1000 / 60)} min)`);
    }
    
    /**
     * Executa rotina de esquecimento ativo diário
     */
    performDailyForgetting() {
        logger.info('memory', '🌙 Executando rotina de esquecimento ativo...');
        
        try {
            // 1. Limpar contextos expirados
            const expiredContexts = this.cleanupExpiredContexts();
            
            // 2. Limpar memórias antigas
            const oldMemories = this.cleanupOldMemories(
                this.MEMORY_RETENTION_DAYS,
                this.MIN_RELEVANCE
            );
            
            // 3. Limpar tópicos antigos
            const oldTopics = this.cleanupOldTopics(this.TOPIC_RETENTION_DAYS);
            
            logger.success('memory', 
                `✨ Esquecimento concluído: ${expiredContexts} contextos, ${oldMemories} memórias, ${oldTopics} tópicos`
            );
            
        } catch (error) {
            logger.error('memory', `Erro no esquecimento ativo: ${error.message}`);
        }
    }
    
    /**
     * Limpa contextos expirados da RAM
     */
    cleanupExpiredContexts() {
        return this.shortTerm.cleanupExpiredContexts();
    }
    
    /**
     * Limpa memórias antigas com baixa relevância
     */
    cleanupOldMemories(daysOld = 90, minRelevance = 0.3) {
        return this.longTerm.cleanupOldMemories(daysOld, minRelevance);
    }
    
    /**
     * Limpa tópicos antigos
     */
    cleanupOldTopics(daysOld = 30) {
        return this.longTerm.cleanupOldTopics(daysOld);
    }
}

module.exports = MemoryCleaner;

