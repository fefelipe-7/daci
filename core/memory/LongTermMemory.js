/**
 * LongTermMemory - Gerenciamento de memória persistente (SQLite)
 * 
 * Responsável por:
 * - Armazenamento permanente em disco
 * - Memórias consolidadas
 * - Tópicos de conversa
 * - Queries e índices otimizados
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../Logger');
const TopicDecay = require('../TopicDecay');

class LongTermMemory {
    constructor() {
        // Inicializar banco de dados SQLite
        const dbDir = path.join(__dirname, '..', '..', 'database');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        this.db = new Database(path.join(dbDir, 'memory.db'));
        this.initTables();
        
        logger.debug('memory', '💾 LongTermMemory inicializado');
    }
    
    /**
     * Inicializa tabelas do banco de dados
     */
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
    
    /**
     * Salva uma memória no banco de dados
     */
    saveMemory(options) {
        const {
            userId,
            guildId = null,
            type,
            content,
            relevance,
            metadata = {}
        } = options;
        
        const now = Date.now();
        
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
                `).run(now, newMentionCount, relevance, bonusScore, existing.id);
                
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
                    relevance,
                    now,
                    now,
                    JSON.stringify(metadata)
                );
                
                logger.success('memory', `Nova memória salva (tipo: ${type}, score: ${relevance.toFixed(2)})`);
            }
        } catch (error) {
            logger.error('memory', `Erro ao salvar memória: ${error.message}`);
        }
    }
    
    /**
     * Busca memórias de um usuário
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
     * Busca tópicos de conversa recentes
     */
    getRecentTopics(userId, limit = 5) {
        const topics = this.db.prepare(`
            SELECT * FROM conversation_topics 
            WHERE user_id = ? 
            ORDER BY ended_at DESC 
            LIMIT ?
        `).all(userId, limit * 2); // Buscar mais para filtrar por relevância
        
        // Aplicar TopicDecay e filtrar por relevância
        const relevantTopics = TopicDecay.filterRelevantTopics(topics, 0.3);
        const rankedTopics = TopicDecay.rankTopics(relevantTopics);
        
        return rankedTopics.slice(0, limit);
    }
    
    /**
     * Salva um tópico de conversa
     */
    saveTopic(userId, guildId, topic, sentiment, messageCount, startedAt, endedAt, summary) {
        try {
            this.db.prepare(`
                INSERT INTO conversation_topics 
                (user_id, guild_id, topic, sentiment, message_count, started_at, ended_at, summary)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(userId, guildId, topic, sentiment, messageCount, startedAt, endedAt, summary);
            
            logger.debug('memory', `Tópico salvo: "${topic}" (${messageCount} msgs)`);
        } catch (error) {
            logger.error('memory', `Erro ao salvar tópico: ${error.message}`);
        }
    }
    
    /**
     * Limpa memórias antigas com baixa relevância
     */
    cleanupOldMemories(daysOld = 90, minRelevance = 0.3) {
        const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        const result = this.db.prepare(`
            DELETE FROM user_memories 
            WHERE last_mentioned_at < ? 
            AND relevance_score < ?
        `).run(cutoff, minRelevance);
        
        if (result.changes > 0) {
            logger.info('memory', `🗑️ Esqueceu ${result.changes} memórias antigas`);
        }
        
        return result.changes;
    }
    
    /**
     * Limpa tópicos antigos
     */
    cleanupOldTopics(daysOld = 30) {
        const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        const result = this.db.prepare(`
            DELETE FROM conversation_topics 
            WHERE ended_at < ?
        `).run(cutoff);
        
        if (result.changes > 0) {
            logger.info('memory', `🗑️ Limpou ${result.changes} tópicos antigos`);
        }
        
        return result.changes;
    }
    
    /**
     * Estatísticas do banco de dados
     */
    getStats() {
        const memoriesCount = this.db.prepare('SELECT COUNT(*) as count FROM user_memories').get().count;
        const topicsCount = this.db.prepare('SELECT COUNT(*) as count FROM conversation_topics').get().count;
        const uniqueUsers = this.db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_memories').get().count;
        
        return {
            totalMemories: memoriesCount,
            totalTopics: topicsCount,
            uniqueUsers
        };
    }
    
    /**
     * Fecha a conexão com o banco de dados
     */
    close() {
        this.db.close();
        logger.debug('memory', '💾 LongTermMemory fechado');
    }
}

module.exports = LongTermMemory;

