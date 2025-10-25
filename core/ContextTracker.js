/**
 * ContextTracker - Rastreador de contexto ativo em tempo real
 * Mantém estado da conversa atual (tópico ativo, entidades, assunto)
 */

const TopicDecay = require('./TopicDecay');
const logger = require('./Logger');

class ContextTracker {
    constructor() {
        // Map de estados por usuário
        this.userStates = new Map(); // { userId: state }
        
        // Configurações
        this.DEFAULT_TTL = 60 * 60 * 1000; // 60 minutos
        this.MAX_ENTITIES_PER_TYPE = 10; // Limite de entidades por tipo
        
        // Timer para limpeza automática
        this.startCleanupTimer();
        
        logger.info('context-tracker', 'ContextTracker inicializado');
    }
    
    /**
     * Obtém estado ativo de um usuário
     * @param {string} userId - ID do usuário
     * @returns {Object|null} Estado atual ou null se expirado
     */
    getActiveState(userId) {
        const state = this.userStates.get(userId);
        
        if (!state) {
            return null;
        }
        
        // Verificar se expirou
        if (Date.now() > state.expiresAt) {
            this.userStates.delete(userId);
            logger.debug('context-tracker', `Estado expirado para user ${userId}`);
            return null;
        }
        
        return state.data;
    }
    
    /**
     * Atualiza contexto com nova informação
     * @param {string} userId - ID do usuário
     * @param {Object} updates - Atualizações a aplicar
     */
    updateContext(userId, updates) {
        const currentState = this.getActiveState(userId);
        
        if (!currentState) {
            // Criar novo estado
            const newState = this.createInitialState(updates);
            this.setState(userId, newState);
            logger.debug('context-tracker', `Novo estado criado para user ${userId}`);
            return newState;
        }
        
        // Atualizar estado existente
        const updatedState = this.mergeUpdates(currentState, updates);
        this.setState(userId, updatedState);
        
        // Log se tópico mudou
        if (updates.topico_ativo && updates.topico_ativo !== currentState.topico_ativo) {
            logger.debug('context-tracker', `Tópico mudou: ${currentState.topico_ativo || 'nenhum'} → ${updates.topico_ativo}`);
        }
        
        return updatedState;
    }
    
    /**
     * Define estado completo para um usuário
     * @param {string} userId - ID do usuário
     * @param {Object} state - Estado a definir
     * @param {number} ttl - Tempo de vida em ms
     */
    setState(userId, state, ttl = this.DEFAULT_TTL) {
        this.userStates.set(userId, {
            data: {
                ...state,
                lastUpdate: Date.now()
            },
            expiresAt: Date.now() + ttl
        });
    }
    
    /**
     * Cria estado inicial
     */
    createInitialState(initialData = {}) {
        return {
            topico_ativo: initialData.topico_ativo || null,
            entidades_ativas: initialData.entidades_ativas || {
                pessoas: [],
                lugares: [],
                eventos: [],
                objetos: [],
                temporal: []
            },
            ultimo_assunto: initialData.ultimo_assunto || null,
            relevancia: 1.0,
            timestamp: Date.now(),
            mention_counts: {}, // Contador de menções por entidade
            ...initialData
        };
    }
    
    /**
     * Merge atualizações com estado existente
     */
    mergeUpdates(currentState, updates) {
        const merged = { ...currentState };
        
        // Atualizar tópico ativo
        if (updates.topico_ativo) {
            merged.topico_ativo = updates.topico_ativo;
            merged.timestamp = Date.now();
            merged.relevancia = 1.0;
        }
        
        // Atualizar último assunto
        if (updates.ultimo_assunto) {
            merged.ultimo_assunto = updates.ultimo_assunto;
        }
        
        // Merge entidades
        if (updates.entidades_ativas) {
            merged.entidades_ativas = this.mergeEntities(
                currentState.entidades_ativas,
                updates.entidades_ativas
            );
            
            // Atualizar contadores de menção
            this.updateMentionCounts(merged, updates.entidades_ativas);
        }
        
        // Atualizar relevância baseada em tempo
        merged.relevancia = TopicDecay.calculateRelevance(merged.timestamp);
        
        return merged;
    }
    
    /**
     * Merge entidades mantendo limite por tipo
     */
    mergeEntities(current, updates) {
        const merged = {};
        
        // Para cada tipo de entidade
        ['pessoas', 'lugares', 'eventos', 'objetos', 'temporal'].forEach(type => {
            const currentSet = new Set(current[type] || []);
            const updateSet = new Set(updates[type] || []);
            
            // Combinar
            const combined = [...currentSet, ...updateSet];
            
            // Limitar tamanho (manter mais recentes)
            merged[type] = combined.slice(-this.MAX_ENTITIES_PER_TYPE);
        });
        
        return merged;
    }
    
    /**
     * Atualiza contadores de menções
     */
    updateMentionCounts(state, newEntities) {
        if (!state.mention_counts) {
            state.mention_counts = {};
        }
        
        // Incrementar contador para cada entidade mencionada
        Object.values(newEntities).flat().forEach(entity => {
            const key = typeof entity === 'string' ? entity : JSON.stringify(entity);
            state.mention_counts[key] = (state.mention_counts[key] || 0) + 1;
        });
    }
    
    /**
     * Limpa estado de um usuário
     * @param {string} userId - ID do usuário
     */
    clearState(userId) {
        this.userStates.delete(userId);
        logger.debug('context-tracker', `Estado limpo para user ${userId}`);
    }
    
    /**
     * Obtém elementos mais relevantes do contexto
     * @param {string} userId - ID do usuário
     * @param {number} limit - Número máximo de elementos
     * @returns {Array} Elementos ordenados por relevância
     */
    getTopContextElements(userId, limit = 5) {
        const state = this.getActiveState(userId);
        
        if (!state) {
            return [];
        }
        
        const elements = [];
        
        // Adicionar tópico ativo
        if (state.topico_ativo) {
            elements.push({
                type: 'topico',
                value: state.topico_ativo,
                score: this.calculateContextScore(state, 'topico', state.topico_ativo)
            });
        }
        
        // Adicionar entidades com scores
        Object.entries(state.entidades_ativas).forEach(([type, entities]) => {
            entities.forEach(entity => {
                elements.push({
                    type,
                    value: entity,
                    score: this.calculateContextScore(state, type, entity)
                });
            });
        });
        
        // Ordenar por score e limitar
        return elements
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    
    /**
     * Calcula score de relevância de um elemento contextual
     * score = (relevancia_temporal * 0.4) + (frequencia_mencoes * 0.3) + (proximidade_topico_ativo * 0.3)
     */
    calculateContextScore(state, type, value) {
        // 1. Relevância temporal (40%)
        const temporal = TopicDecay.calculateRelevance(state.timestamp) * 0.4;
        
        // 2. Frequência de menções (30%)
        const key = typeof value === 'string' ? value : JSON.stringify(value);
        const mentions = state.mention_counts[key] || 1;
        const maxMentions = Math.max(...Object.values(state.mention_counts || {}), 1);
        const frequency = (mentions / maxMentions) * 0.3;
        
        // 3. Proximidade ao tópico ativo (30%)
        let proximity = 0;
        if (type === 'topico' || 
            (state.topico_ativo && state.topico_ativo.includes(String(value).toLowerCase()))) {
            proximity = 0.3;
        } else {
            proximity = 0.15;
        }
        
        return temporal + frequency + proximity;
    }
    
    /**
     * Inicia timer de limpeza automática
     */
    startCleanupTimer() {
        setInterval(() => {
            this.cleanupExpiredStates();
        }, 10 * 60 * 1000); // A cada 10 minutos
    }
    
    /**
     * Limpa estados expirados
     */
    cleanupExpiredStates() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [userId, state] of this.userStates.entries()) {
            if (now > state.expiresAt) {
                this.userStates.delete(userId);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            logger.debug('context-tracker', `Limpou ${cleaned} estados expirados`);
        }
    }
    
    /**
     * Obtém estatísticas do tracker
     */
    getStats() {
        return {
            active_users: this.userStates.size,
            total_states: this.userStates.size
        };
    }
}

module.exports = ContextTracker;

