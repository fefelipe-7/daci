/**
 * ConversationThreading - Rastreamento de threads e turnos de conversa
 * Gerencia expected responses e detecta continuação vs novo tópico
 */

const { v4: uuidv4 } = require('crypto').webcrypto || require('crypto');
const logger = require('./Logger');

class ConversationThreading {
    constructor() {
        // Map de threads por usuário
        this.userThreads = new Map(); // { userId: currentThread }
        
        // Configurações
        this.THREAD_TIMEOUT = 5 * 60 * 1000; // 5 minutos
        this.MAX_TURNS_PER_THREAD = 20;
        
        // Padrões de perguntas do bot (para detectar expected responses)
        this.questionPatterns = [
            /\?$/,
            /\b(qual|que|como|quando|onde|quem|por que|pq)\b/i,
            /\b(pode|poderia|consegue|sabe|tem|teria)\b.*\?/i
        ];
        
        logger.info('conversation-threading', 'ConversationThreading inicializado');
    }
    
    /**
     * Inicia novo thread de conversa
     * @param {string} topic - Tópico do thread
     * @param {string} userId - ID do usuário
     * @returns {Object} Thread criado
     */
    startThread(topic, userId) {
        const thread = {
            thread_id: this.generateThreadId(),
            userId,
            iniciado_em: Date.now(),
            turnos: [],
            esperando_resposta: false,
            tipo_resposta_esperada: null,
            topico_thread: topic,
            status: 'ativo',
            last_activity: Date.now()
        };
        
        this.userThreads.set(userId, thread);
        logger.debug('threading', `Novo thread iniciado para user ${userId}: ${topic}`);
        
        return thread;
    }
    
    /**
     * Adiciona turno ao thread atual
     * @param {string} userId - ID do usuário
     * @param {string} userMsg - Mensagem do usuário
     * @param {string} botMsg - Resposta do bot
     * @param {Object} metadata - Metadados opcionais
     */
    addTurn(userId, userMsg, botMsg, metadata = {}) {
        let thread = this.userThreads.get(userId);
        
        if (!thread || thread.status === 'fechado') {
            // Se não há thread ou está fechado, criar novo
            thread = this.startThread(metadata.topic || 'conversa geral', userId);
        }
        
        // Verificar timeout
        if (Date.now() - thread.last_activity > this.THREAD_TIMEOUT) {
            this.closeThread(userId);
            thread = this.startThread(metadata.topic || 'conversa geral', userId);
        }
        
        // Adicionar turno
        const turn = {
            id: thread.turnos.length + 1,
            user: userMsg,
            bot: botMsg,
            timestamp: Date.now(),
            metadata
        };
        
        thread.turnos.push(turn);
        thread.last_activity = Date.now();
        
        // Verificar se bot fez pergunta
        if (this.botAskedQuestion(botMsg)) {
            thread.esperando_resposta = true;
            thread.tipo_resposta_esperada = this.inferExpectedResponseType(botMsg, metadata);
            logger.debug('threading', `Bot fez pergunta, esperando resposta sobre: ${thread.tipo_resposta_esperada}`);
        } else {
            thread.esperando_resposta = false;
            thread.tipo_resposta_esperada = null;
        }
        
        // Limitar número de turnos
        if (thread.turnos.length > this.MAX_TURNS_PER_THREAD) {
            thread.turnos.shift(); // Remove mais antigo
        }
        
        return thread;
    }
    
    /**
     * Verifica se mensagem é resposta ao thread atual
     * @param {string} message - Mensagem do usuário
     * @param {string} userId - ID do usuário
     * @param {Object} entities - Entidades extraídas da mensagem
     * @returns {Object} { isResponse: boolean, confidence: number, reason: string }
     */
    isResponseToThread(message, userId, entities = {}) {
        const thread = this.userThreads.get(userId);
        
        if (!thread || thread.status === 'fechado') {
            return { isResponse: false, confidence: 0, reason: 'no_active_thread' };
        }
        
        // Se thread expirou
        if (Date.now() - thread.last_activity > this.THREAD_TIMEOUT) {
            this.closeThread(userId);
            return { isResponse: false, confidence: 0, reason: 'thread_expired' };
        }
        
        // Se bot está esperando resposta específica
        if (thread.esperando_resposta) {
            const matchResult = this.matchesExpectedResponse(message, thread, entities);
            if (matchResult.matches) {
                return {
                    isResponse: true,
                    confidence: 0.9,
                    reason: 'expected_response',
                    details: matchResult
                };
            }
        }
        
        // Verificar se mensagem é muito diferente do tópico do thread
        const topicSimilarity = this.calculateTopicSimilarity(message, thread.topico_thread, entities);
        
        if (topicSimilarity > 0.6) {
            return {
                isResponse: true,
                confidence: topicSimilarity,
                reason: 'topic_similarity'
            };
        }
        
        // Verificar pronomes/referências (indica continuação)
        const hasReferences = this.hasContextReferences(message);
        if (hasReferences) {
            return {
                isResponse: true,
                confidence: 0.7,
                reason: 'contextual_references'
            };
        }
        
        return {
            isResponse: false,
            confidence: topicSimilarity,
            reason: 'topic_changed'
        };
    }
    
    /**
     * Fecha thread atual
     * @param {string} userId - ID do usuário
     */
    closeThread(userId) {
        const thread = this.userThreads.get(userId);
        
        if (thread) {
            thread.status = 'fechado';
            thread.fechado_em = Date.now();
            logger.debug('threading', `Thread fechado para user ${userId} após ${thread.turnos.length} turnos`);
        }
    }
    
    /**
     * Marca que bot espera resposta específica
     * @param {string} userId - ID do usuário
     * @param {string} responseType - Tipo de resposta esperada
     */
    expectResponse(userId, responseType) {
        const thread = this.userThreads.get(userId);
        
        if (thread) {
            thread.esperando_resposta = true;
            thread.tipo_resposta_esperada = responseType;
        }
    }
    
    /**
     * Obtém thread atual de um usuário
     */
    getCurrentThread(userId) {
        const thread = this.userThreads.get(userId);
        
        if (!thread || thread.status === 'fechado') {
            return null;
        }
        
        // Verificar timeout
        if (Date.now() - thread.last_activity > this.THREAD_TIMEOUT) {
            this.closeThread(userId);
            return null;
        }
        
        return thread;
    }
    
    /**
     * Verifica se bot fez pergunta
     */
    botAskedQuestion(botMsg) {
        if (!botMsg) return false;
        
        return this.questionPatterns.some(pattern => pattern.test(botMsg));
    }
    
    /**
     * Infere tipo de resposta esperada baseado na pergunta do bot
     */
    inferExpectedResponseType(botMsg, metadata) {
        const lower = botMsg.toLowerCase();
        
        // Padrões específicos
        if (lower.includes('sabor') || lower.includes('qual')) {
            return 'escolha_especifica';
        }
        if (lower.includes('quando') || lower.includes('que horas')) {
            return 'informacao_temporal';
        }
        if (lower.includes('onde')) {
            return 'localizacao';
        }
        if (lower.includes('quem')) {
            return 'pessoa';
        }
        if (lower.includes('como')) {
            return 'explicacao';
        }
        if (lower.includes('por que') || lower.includes('pq')) {
            return 'justificativa';
        }
        
        // Se há tópico nos metadados, usar como esperado
        if (metadata.topic) {
            return metadata.topic;
        }
        
        return 'resposta_geral';
    }
    
    /**
     * Verifica se mensagem corresponde à resposta esperada
     */
    matchesExpectedResponse(message, thread, entities) {
        const expectedType = thread.tipo_resposta_esperada;
        
        if (!expectedType) {
            return { matches: false };
        }
        
        // Padrões de matching por tipo
        const matches = {
            escolha_especifica: entities.objetos?.length > 0 || /\b\w+\b/.test(message),
            informacao_temporal: entities.temporal?.length > 0,
            localizacao: entities.lugares?.length > 0,
            pessoa: entities.pessoas?.length > 0,
            explicacao: message.length > 20,
            justificativa: message.length > 20,
            resposta_geral: message.length > 0
        };
        
        return {
            matches: matches[expectedType] !== false,
            confidence: matches[expectedType] ? 0.9 : 0.3
        };
    }
    
    /**
     * Calcula similaridade entre mensagem e tópico do thread
     */
    calculateTopicSimilarity(message, threadTopic, entities) {
        if (!threadTopic) return 0.5;
        
        const lowerMsg = message.toLowerCase();
        const lowerTopic = threadTopic.toLowerCase();
        
        // Verificar se tópico está na mensagem
        if (lowerMsg.includes(lowerTopic)) {
            return 0.9;
        }
        
        // Verificar entidades relacionadas
        const allEntities = Object.values(entities).flat();
        const topicWords = lowerTopic.split(' ');
        
        const overlap = topicWords.filter(word => 
            allEntities.some(entity => 
                String(entity).toLowerCase().includes(word)
            )
        ).length;
        
        return overlap / topicWords.length;
    }
    
    /**
     * Verifica se mensagem tem referências contextuais
     */
    hasContextReferences(message) {
        const references = [
            'ele', 'ela', 'isso', 'esse', 'essa', 'aquilo', 'disso',
            'também', 'tbm', 'ainda', 'tipo', 'assim'
        ];
        
        const lowerMsg = message.toLowerCase();
        return references.some(ref => new RegExp(`\\b${ref}\\b`).test(lowerMsg));
    }
    
    /**
     * Gera ID único para thread
     */
    generateThreadId() {
        return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Obtém resumo do thread para incluir no contexto
     */
    getThreadSummary(userId) {
        const thread = this.getCurrentThread(userId);
        
        if (!thread) {
            return null;
        }
        
        return {
            topico: thread.topico_thread,
            turnos: thread.turnos.length,
            esperando_resposta: thread.esperando_resposta,
            tipo_esperado: thread.tipo_resposta_esperada,
            duracao_minutos: Math.floor((Date.now() - thread.iniciado_em) / 60000)
        };
    }
}

module.exports = ConversationThreading;

