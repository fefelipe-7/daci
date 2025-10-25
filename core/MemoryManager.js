/**
 * MemoryManager - Sistema híbrido de memória (RAM + SQLite)
 * 
 * Arquitetura:
 * - Memória de curto prazo: Map em RAM (contexto ativo, TTL automático)
 * - Memória de longo prazo: SQLite (aprendizado consolidado)
 * 
 * Preparado para migração futura para Redis sem mudança de interface
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('./Logger');

class MemoryManager {
    constructor() {
        // ===== MEMÓRIA DE CURTO PRAZO (RAM) =====
        this.activeContexts = new Map(); // { userId: { data, expiresAt } }
        this.conversationHistory = new Map(); // { userId: [messages] }
        
        // ===== LOCKS PARA PREVENIR RACE CONDITIONS =====
        this.consolidationLocks = new Map(); // { userId: boolean }
        this.processingLocks = new Map(); // { userId: Promise }
        
        // ===== MEMÓRIA DE LONGO PRAZO (SQLite) =====
        const dbDir = path.join(__dirname, '..', 'database');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        this.db = new Database(path.join(dbDir, 'memory.db'));
        this.initTables();
        
        // ===== CONFIGURAÇÕES =====
        this.DEFAULT_TTL = 60 * 60 * 1000; // 1 hora
        this.MAX_HISTORY_SIZE = 20; // Máximo de mensagens no histórico
        this.CONSOLIDATION_THRESHOLD = 5; // Consolidar após N mensagens
        
        // ===== LIMPEZA AUTOMÁTICA =====
        this.startCleanupTimer();
        
        logger.info('memory', '🧠 MemoryManager iniciado (RAM + SQLite)');
    }
    
    // ========================================================================
    // INICIALIZAÇÃO
    // ========================================================================
    
    initTables() {
        // Tabela de memórias consolidadas (longo prazo)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS user_memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                memory_type TEXT NOT NULL,
                content TEXT NOT NULL,
                relevance_score REAL DEFAULT 1.0,
                first_mentioned_at INTEGER NOT NULL,
                last_mentioned_at INTEGER NOT NULL,
                mention_count INTEGER DEFAULT 1,
                metadata TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);
        
        // Índices para performance
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_memories 
            ON user_memories(user_id, relevance_score DESC);
            
            CREATE INDEX IF NOT EXISTS idx_memory_type 
            ON user_memories(user_id, memory_type);
        `);
        
        // Tabela de tópicos de conversa (histórico consolidado)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS conversation_topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                topic TEXT NOT NULL,
                sentiment TEXT,
                message_count INTEGER DEFAULT 1,
                started_at INTEGER NOT NULL,
                ended_at INTEGER NOT NULL,
                summary TEXT
            )
        `);
        
        logger.success('memory', 'Tabelas de memória inicializadas');
    }
    
    // ========================================================================
    // CONTEXTO ATIVO (RAM - CURTO PRAZO)
    // ========================================================================
    
    /**
     * Obter contexto ativo de um usuário
     * @param {string} userId - ID do usuário
     * @returns {Object|null} Contexto ou null se expirado
     */
    getActiveContext(userId) {
        const context = this.activeContexts.get(userId);
        
        if (!context) {
            return null;
        }
        
        // Verificar se expirou
        if (Date.now() > context.expiresAt) {
            this.activeContexts.delete(userId);
            logger.debug('memory', `Contexto expirado para user ${userId}`);
            return null;
        }
        
        return context.data;
    }
    
    /**
     * Definir/atualizar contexto ativo
     * @param {string} userId - ID do usuário
     * @param {Object} data - Dados do contexto
     * @param {number} ttl - Tempo de vida em ms (opcional)
     */
    setActiveContext(userId, data, ttl = this.DEFAULT_TTL) {
        this.activeContexts.set(userId, {
            data: {
                ...data,
                lastUpdate: Date.now()
            },
            expiresAt: Date.now() + ttl
        });
        
        logger.debug('memory', `Contexto atualizado para user ${userId} (TTL: ${ttl}ms)`);
    }
    
    /**
     * Adicionar mensagem ao histórico de conversa
     * @param {string} userId - ID do usuário
     * @param {Object} message - { role: 'user'|'bot', content: string }
     * @param {string} guildId - ID do servidor (opcional)
     */
    addToHistory(userId, message, guildId = null) {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        
        const history = this.conversationHistory.get(userId);
        history.push({
            ...message,
            timestamp: Date.now()
        });
        
        // Limitar tamanho do histórico (FIFO)
        if (history.length > this.MAX_HISTORY_SIZE) {
            history.shift();
        }
        
        // Verificar se deve consolidar (COM LOCK para evitar race condition)
        if (history.length >= this.CONSOLIDATION_THRESHOLD && !this.consolidationLocks.get(userId)) {
            this.consolidateIfNeeded(userId, guildId);
        }
    }
    
    /**
     * Obter histórico de conversa recente
     * @param {string} userId - ID do usuário
     * @param {number} limit - Número máximo de mensagens
     * @returns {Array} Histórico de mensagens
     */
    getHistory(userId, limit = 10) {
        const history = this.conversationHistory.get(userId) || [];
        return history.slice(-limit);
    }
    
    /**
     * Limpar contexto e histórico de um usuário
     * @param {string} userId - ID do usuário
     */
    clearContext(userId) {
        this.activeContexts.delete(userId);
        this.conversationHistory.delete(userId);
        logger.debug('memory', `Contexto limpo para user ${userId}`);
    }
    
    // ========================================================================
    // CONSOLIDAÇÃO (RAM → SQLite)
    // ========================================================================
    
    /**
     * Consolidar memórias do usuário (RAM → SQLite)
     * @param {string} userId - ID do usuário
     * @param {string} guildId - ID do servidor (opcional)
     */
    consolidateIfNeeded(userId, guildId = null) {
        const history = this.conversationHistory.get(userId);
        
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
            const topics = this.extractTopics(history);
            
            // Detectar sentimento geral
            const sentiment = this.detectSentiment(history);
            
            // Salvar no SQLite
            if (topics.length > 0) {
                const startTime = history[0].timestamp;
                const endTime = history[history.length - 1].timestamp;
                
                const stmt = this.db.prepare(`
                    INSERT INTO conversation_topics 
                    (user_id, guild_id, topic, sentiment, message_count, started_at, ended_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                
                topics.forEach(topic => {
                    stmt.run(
                        userId,
                        guildId,
                        topic,
                        sentiment,
                        history.length,
                        startTime,
                        endTime
                    );
                });
                
                logger.success('memory', `Consolidado ${topics.length} tópicos para user ${userId}`);
            }
            
            // Limpar histórico antigo (manter últimas 5)
            const toKeep = history.slice(-5);
            this.conversationHistory.set(userId, toKeep);
            
        } catch (error) {
            logger.error('memory', `Erro ao consolidar memória: ${error.message}`);
        } finally {
            // UNLOCK: Liberar lock de consolidação
            this.consolidationLocks.set(userId, false);
        }
    }
    
    /**
     * Extrair tópicos relevantes do histórico
     * @param {Array} history - Histórico de mensagens
     * @returns {Array<string>} Lista de tópicos
     */
    extractTopics(history) {
        const topics = new Set();
        const keywords = [
            'meme', 'música', 'jogo', 'anime', 'série', 'filme',
            'comida', 'trabalho', 'estudo', 'família', 'amigo',
            'pizza', 'festa', 'rolê', 'zoeira', 'mina', 'mano'
        ];
        
        history.forEach(msg => {
            const content = msg.content.toLowerCase();
            keywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    topics.add(keyword);
                }
            });
        });
        
        return Array.from(topics);
    }
    
    /**
     * Detectar sentimento geral da conversa
     * @param {Array} history - Histórico de mensagens
     * @returns {string} Sentimento ('positive', 'negative', 'neutral')
     */
    detectSentiment(history) {
        const positiveWords = ['legal', 'massa', 'top', 'daora', 'brabo', 'chave', 'insano', '😎', '🔥', '💯', 'amo'];
        const negativeWords = ['ruim', 'chato', 'zoado', 'merda', 'odeio', '😭', '💀', '😤'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        history.forEach(msg => {
            const content = msg.content.toLowerCase();
            positiveWords.forEach(word => {
                if (content.includes(word)) positiveCount++;
            });
            negativeWords.forEach(word => {
                if (content.includes(word)) negativeCount++;
            });
        });
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }
    
    // ========================================================================
    // MEMÓRIAS DE LONGO PRAZO (SQLite)
    // ========================================================================
    
    /**
     * Salvar memória permanente com scoring de relevância
     * @param {Object} options - Opções da memória
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
        
        const now = Date.now();
        
        // Calcular relevância automaticamente se não fornecida
        let finalRelevance = relevance || this.calculateRelevance(content, type);
        
        try {
            // Verificar se já existe memória similar
            const existing = this.db.prepare(`
                SELECT * FROM user_memories 
                WHERE user_id = ? AND memory_type = ? AND content = ?
            `).get(userId, type, content);
            
            if (existing) {
                // Atualizar memória existente
                const newMentionCount = existing.mention_count + 1;
                const bonusScore = newMentionCount > 3 ? 0.2 : 0;
                
                this.db.prepare(`
                    UPDATE user_memories 
                    SET last_mentioned_at = ?,
                        mention_count = ?,
                        relevance_score = MIN(1.0, MAX(relevance_score, ?) + ?)
                    WHERE id = ?
                `).run(now, newMentionCount, finalRelevance, bonusScore, existing.id);
                
                logger.debug('memory', `Memória atualizada (ID: ${existing.id}, mentions: ${newMentionCount})`);
            } else {
                // Criar nova memória
                this.db.prepare(`
                    INSERT INTO user_memories 
                    (user_id, guild_id, memory_type, content, relevance_score, 
                     first_mentioned_at, last_mentioned_at, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    userId,
                    guildId,
                    type,
                    content,
                    finalRelevance,
                    now,
                    now,
                    JSON.stringify(metadata)
                );
                
                logger.success('memory', `Nova memória salva (tipo: ${type}, score: ${finalRelevance.toFixed(2)})`);
            }
        } catch (error) {
            logger.error('memory', `Erro ao salvar memória: ${error.message}`);
        }
    }
    
    /**
     * Calcular score de relevância baseado em conteúdo e tipo
     * @param {string} content - Conteúdo da memória
     * @param {string} type - Tipo de memória
     * @returns {number} Score de 0.0 a 1.0
     */
    calculateRelevance(content, type) {
        let score = 0.5; // Base
        const lowerContent = content.toLowerCase();
        
        // Preferências explícitas
        if (lowerContent.includes('gosto') || lowerContent.includes('amo') || lowerContent.includes('prefiro')) {
            score = 0.9;
        }
        
        // Rejeições
        if (lowerContent.includes('odeio') || lowerContent.includes('não gosto')) {
            score = 0.8;
        }
        
        // Informações pessoais
        if (lowerContent.includes('meu') || lowerContent.includes('minha') || /[A-Z][a-z]+/.test(content)) {
            score = Math.max(score, 0.7);
        }
        
        // Sentimento forte
        const strongPositive = ['amo', 'adoro', 'demais', 'insano', 'brabo'];
        const strongNegative = ['odeio', 'péssimo', 'horrível'];
        
        if (strongPositive.some(w => lowerContent.includes(w)) || 
            strongNegative.some(w => lowerContent.includes(w))) {
            score += 0.1;
        }
        
        // Tipo de memória
        if (type === 'preference') {
            score += 0.1;
        }
        
        return Math.min(1.0, score);
    }
    
    /**
     * Buscar memórias de um usuário
     * @param {string} userId - ID do usuário
     * @param {Object} filters - Filtros opcionais
     * @returns {Array} Lista de memórias
     */
    getMemories(userId, filters = {}) {
        let query = 'SELECT * FROM user_memories WHERE user_id = ?';
        const params = [userId];
        
        if (filters.type) {
            query += ' AND memory_type = ?';
            params.push(filters.type);
        }
        
        if (filters.minRelevance) {
            query += ' AND relevance_score >= ?';
            params.push(filters.minRelevance);
        }
        
        query += ' ORDER BY relevance_score DESC, last_mentioned_at DESC';
        
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }
        
        return this.db.prepare(query).all(...params);
    }
    
    /**
     * Buscar tópicos de conversa recentes
     * @param {string} userId - ID do usuário
     * @param {number} limit - Número de tópicos
     * @returns {Array} Lista de tópicos
     */
    getRecentTopics(userId, limit = 5) {
        return this.db.prepare(`
            SELECT * FROM conversation_topics 
            WHERE user_id = ? 
            ORDER BY ended_at DESC 
            LIMIT ?
        `).all(userId, limit);
    }
    
    // ========================================================================
    // LIMPEZA E MANUTENÇÃO
    // ========================================================================
    
    /**
     * Iniciar timer de limpeza automática
     */
    startCleanupTimer() {
        // Limpar contextos expirados a cada 5 minutos
        setInterval(() => {
            this.cleanupExpiredContexts();
        }, 5 * 60 * 1000);
    }
    
    /**
     * Limpar contextos expirados da RAM
     */
    cleanupExpiredContexts() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [userId, context] of this.activeContexts.entries()) {
            if (now > context.expiresAt) {
                this.activeContexts.delete(userId);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            logger.info('memory', `🧹 ${cleaned} contextos expirados removidos`);
        }
    }
    
    /**
     * Limpar memórias antigas e irrelevantes do SQLite
     * @param {number} daysOld - Idade em dias
     * @param {number} minRelevance - Relevância mínima
     */
    cleanupOldMemories(daysOld = 30, minRelevance = 0.3) {
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        const result = this.db.prepare(`
            DELETE FROM user_memories 
            WHERE last_mentioned_at < ? AND relevance_score < ?
        `).run(cutoffTime, minRelevance);
        
        logger.info('memory', `🗑️ ${result.changes} memórias antigas removidas`);
    }
    
    /**
     * Obter estatísticas da memória
     * @returns {Object} Estatísticas
     */
    getStats() {
        const activeContextsCount = this.activeContexts.size;
        const conversationCount = this.conversationHistory.size;
        
        const memoriesCount = this.db.prepare(
            'SELECT COUNT(*) as count FROM user_memories'
        ).get().count;
        
        const topicsCount = this.db.prepare(
            'SELECT COUNT(*) as count FROM conversation_topics'
        ).get().count;
        
        return {
            ram: {
                activeContexts: activeContextsCount,
                activeConversations: conversationCount,
                historyMessages: Array.from(this.conversationHistory.values())
                    .reduce((sum, hist) => sum + hist.length, 0)
            },
            sqlite: {
                memories: memoriesCount,
                topics: topicsCount
            }
        };
    }
    
    // ========================================================================
    // UTILIDADES
    // ========================================================================
    
    /**
     * Fechar conexões e salvar estado
     */
    async shutdown() {
        logger.info('memory', '💾 Salvando estado da memória...');
        
        // Consolidar todas as conversas ativas
        for (const userId of this.conversationHistory.keys()) {
            this.consolidateIfNeeded(userId);
        }
        
        this.db.close();
        logger.success('memory', 'MemoryManager finalizado');
    }
}

// Exportar instância singleton
module.exports = new MemoryManager();

