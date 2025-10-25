/**
 * TopicDecay - Sistema de relevância temporal de tópicos
 * Calcula quão relevante um tópico ainda é baseado no tempo decorrido
 */

class TopicDecay {
    /**
     * Calcula relevância baseada em tempo decorrido
     * Fórmula: relevância = e^(-t/1800) onde t = segundos passados
     * Resultado: 50% relevância em 30 minutos
     * 
     * @param {number} timestamp - Timestamp quando tópico foi mencionado
     * @param {number} now - Timestamp atual (opcional, usa Date.now())
     * @returns {number} Relevância entre 0 e 1
     */
    static calculateRelevance(timestamp, now = Date.now()) {
        const secondsPassed = (now - timestamp) / 1000;
        
        // Constante de decay: 1800 segundos = 30 minutos para 50% relevância
        const DECAY_CONSTANT = 1800;
        
        // Fórmula exponencial de decay
        const relevance = Math.exp(-secondsPassed / DECAY_CONSTANT);
        
        // Garantir que está entre 0 e 1
        return Math.max(0, Math.min(1, relevance));
    }
    
    /**
     * Filtra tópicos por relevância mínima
     * @param {Array} topics - Array de tópicos com timestamp
     * @param {number} threshold - Relevância mínima (padrão: 0.3)
     * @returns {Array} Tópicos relevantes
     */
    static filterRelevantTopics(topics, threshold = 0.3) {
        const now = Date.now();
        
        return topics.filter(topic => {
            const relevance = this.calculateRelevance(topic.timestamp || topic.last_mentioned_at, now);
            return relevance >= threshold;
        });
    }
    
    /**
     * Ordena tópicos por relevância (mais relevante primeiro)
     * @param {Array} topics - Array de tópicos com timestamp
     * @returns {Array} Tópicos ordenados por relevância
     */
    static rankTopics(topics) {
        const now = Date.now();
        
        return topics
            .map(topic => ({
                ...topic,
                relevance: this.calculateRelevance(topic.timestamp || topic.last_mentioned_at, now)
            }))
            .sort((a, b) => b.relevance - a.relevance);
    }
    
    /**
     * Adiciona score de relevância a cada tópico sem modificar array original
     * @param {Array} topics - Array de tópicos
     * @returns {Array} Novo array com scores de relevância
     */
    static addRelevanceScores(topics) {
        const now = Date.now();
        
        return topics.map(topic => ({
            ...topic,
            relevance: this.calculateRelevance(topic.timestamp || topic.last_mentioned_at, now),
            age_minutes: Math.floor((now - (topic.timestamp || topic.last_mentioned_at)) / 60000)
        }));
    }
    
    /**
     * Determina categoria de relevância
     * @param {number} relevance - Score de relevância (0-1)
     * @returns {string} Categoria: 'alta', 'media', 'baixa'
     */
    static getRelevanceCategory(relevance) {
        if (relevance >= 0.7) return 'alta';
        if (relevance >= 0.3) return 'media';
        return 'baixa';
    }
    
    /**
     * Calcula tempo até relevância cair abaixo do threshold
     * @param {number} currentRelevance - Relevância atual (0-1)
     * @param {number} threshold - Threshold desejado (padrão: 0.3)
     * @returns {number} Minutos até atingir threshold
     */
    static timeUntilThreshold(currentRelevance, threshold = 0.3) {
        if (currentRelevance <= threshold) return 0;
        
        const DECAY_CONSTANT = 1800; // 30 minutos
        
        // Resolver: threshold = currentRelevance * e^(-t/DECAY_CONSTANT)
        // t = -DECAY_CONSTANT * ln(threshold / currentRelevance)
        const seconds = -DECAY_CONSTANT * Math.log(threshold / currentRelevance);
        return Math.floor(seconds / 60);
    }
}

module.exports = TopicDecay;

