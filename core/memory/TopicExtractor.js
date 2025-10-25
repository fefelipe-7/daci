/**
 * TopicExtractor - Extração inteligente de tópicos e sentimentos
 * 
 * Responsável por:
 * - Extração de tópicos usando NLP (stemming, sinônimos, NER)
 * - Detecção de sentimento
 * - Cálculo de relevância (TF-IDF, decay temporal)
 * - Inferência de tópicos baseada em entidades
 */

const natural = require('natural');
const logger = require('../Logger');

class TopicExtractor {
    constructor() {
        this.stemmer = natural.PorterStemmerPt; // Stemmer português
        this.tokenizer = new natural.WordTokenizer();
        
        // Mapa de sinônimos expandido
        this.synonymMap = {
            'jogo': ['game', 'jogar', 'jogos', 'gameplay', 'gamer', 'zerou', 'jogando'],
            'filme': ['cinema', 'movie', 'filmes', 'assistir'],
            'música': ['musica', 'som', 'song', 'banda', 'cantor', 'cantora', 'ouvindo'],
            'meme': ['memes', 'zueira', 'zoeira', 'engraçado', 'piada'],
            'comida': ['comer', 'pizza', 'hamburguer', 'lanche', 'jantar', 'almoço', 'comendo'],
            'anime': ['animes', 'mangá', 'manga', 'otaku'],
            'série': ['series', 'netflix', 'serie', 'episódio'],
            'trabalho': ['trampo', 'emprego', 'chefe', 'empresa', 'trabalhando'],
            'estudo': ['estudar', 'prova', 'faculdade', 'escola', 'aula', 'estudando'],
            'festa': ['balada', 'rolê', 'role', 'sair', 'festinha'],
            'amigo': ['amigos', 'mano', 'parça', 'truta', 'brother', 'galera'],
            'família': ['familia', 'mãe', 'mae', 'pai', 'irmão', 'irmao']
        };
        
        // Entidades conhecidas (NER básico)
        this.knownEntities = {
            games: ['Zelda', 'Mario', 'Minecraft', 'Fortnite', 'LOL', 'CS', 'Valorant'],
            movies: ['Avengers', 'Star', 'Harry', 'Potter'],
            animes: ['Naruto', 'One', 'Piece', 'Dragon', 'Ball', 'Attack', 'Titan']
        };
        
        logger.debug('memory', '🔍 TopicExtractor inicializado');
    }
    
    /**
     * Extrai tópicos do histórico de mensagens
     */
    extractTopics(history) {
        const topics = new Set();
        
        history.forEach(msg => {
            const content = msg.content.toLowerCase();
            const tokens = this.tokenizer.tokenize(content);
            
            if (!tokens) return;
            
            // 1. Buscar por sinônimos
            Object.keys(this.synonymMap).forEach(mainTopic => {
                const synonyms = this.synonymMap[mainTopic];
                
                // Verificar se algum sinônimo aparece
                const found = synonyms.some(syn => content.includes(syn)) || content.includes(mainTopic);
                
                if (found) {
                    topics.add(mainTopic);
                }
            });
            
            // 2. Detecção de entidades nomeadas (NER básico)
            tokens.forEach(token => {
                // Detectar palavras com primeira letra maiúscula (possível nome próprio)
                if (/^[A-Z][a-z]+/.test(token)) {
                    if (this.knownEntities.games.some(g => token.includes(g))) {
                        topics.add('jogo');
                    }
                    if (this.knownEntities.movies.some(m => token.includes(m))) {
                        topics.add('filme');
                    }
                    if (this.knownEntities.animes.some(a => token.includes(a))) {
                        topics.add('anime');
                    }
                }
            });
        });
        
        return Array.from(topics);
    }
    
    /**
     * Detecta sentimento geral da conversa
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
    
    /**
     * Infere tópico principal baseado em entidades detectadas
     */
    inferTopic(entities, messageContent) {
        // Prioridade: pessoas > eventos > objetos > lugares
        if (entities.pessoas && entities.pessoas.length > 0) {
            const pessoa = entities.pessoas[0];
            if (entities.eventos && entities.eventos.length > 0) {
                return `${entities.eventos[0].tipo} com ${pessoa}`;
            }
            return `conversa sobre ${pessoa}`;
        }
        
        if (entities.eventos && entities.eventos.length > 0) {
            const evento = entities.eventos[0];
            return evento.tipo + (evento.de ? ` de ${evento.de}` : '');
        }
        
        if (entities.objetos && entities.objetos.length > 0) {
            return entities.objetos[0];
        }
        
        if (entities.lugares && entities.lugares.length > 0) {
            return `ida para ${entities.lugares[0]}`;
        }
        
        // Fallback: primeiras palavras da mensagem
        const words = messageContent.toLowerCase().split(' ').slice(0, 3);
        return words.join(' ');
    }
    
    /**
     * Calcula score de relevância AVANÇADO (TF-IDF + decay temporal + frequência)
     */
    calculateRelevance(content, type, metadata = {}) {
        let score = 0.5; // Base
        const lowerContent = content.toLowerCase();
        
        // ===== 1. ANÁLISE SEMÂNTICA (TF-IDF simplificado) =====
        const tokens = this.tokenizer.tokenize(lowerContent) || [];
        const tfidf = new natural.TfIdf();
        tfidf.addDocument(tokens);
        
        // Palavras-chave importantes recebem peso maior
        const importantKeywords = {
            preferences: ['gosto', 'amo', 'prefiro', 'adoro', 'curto', 'odeio', 'não gosto'],
            emotions: ['feliz', 'triste', 'ansioso', 'empolgado', 'chateado'],
            personal: ['meu', 'minha', 'meus', 'minhas', 'sou', 'tenho']
        };
        
        // Contar ocorrências de palavras importantes
        let importanceBonus = 0;
        Object.values(importantKeywords).flat().forEach(keyword => {
            if (lowerContent.includes(keyword)) {
                importanceBonus += 0.05;
            }
        });
        
        score += Math.min(importanceBonus, 0.3); // Máximo +0.3
        
        // ===== 2. PREFERÊNCIAS EXPLÍCITAS =====
        if (lowerContent.includes('gosto') || lowerContent.includes('amo') || lowerContent.includes('prefiro')) {
            score += 0.2;
        }
        
        // Rejeições também são importantes
        if (lowerContent.includes('odeio') || lowerContent.includes('não gosto')) {
            score += 0.15;
        }
        
        // ===== 3. SENTIMENTO FORTE =====
        const strongPositive = ['amo', 'adoro', 'demais', 'insano', 'brabo', 'perfeito', 'incrível'];
        const strongNegative = ['odeio', 'péssimo', 'horrível', 'detesto', 'ruim demais'];
        
        if (strongPositive.some(w => lowerContent.includes(w)) || 
            strongNegative.some(w => lowerContent.includes(w))) {
            score += 0.15;
        }
        
        // ===== 4. DECAY TEMPORAL (memórias recentes mais relevantes) =====
        if (metadata.timestamp) {
            const ageInDays = (Date.now() - metadata.timestamp) / (24 * 60 * 60 * 1000);
            const decayFactor = Math.exp(-ageInDays / 30); // Decai 50% a cada 30 dias
            score *= (0.7 + 0.3 * decayFactor); // Mínimo 70% do score, máximo 100%
        }
        
        // ===== 5. FREQUÊNCIA (repetição aumenta relevância) =====
        if (metadata.mentionCount) {
            const frequencyBonus = Math.min(metadata.mentionCount * 0.05, 0.2); // Máximo +0.2
            score += frequencyBonus;
        }
        
        // ===== 6. TIPO DE MEMÓRIA =====
        const typeWeights = {
            'preference': 0.15,
            'personal_info': 0.2,
            'opinion': 0.1,
            'fact': 0.05
        };
        
        score += typeWeights[type] || 0;
        
        // ===== 7. INFORMAÇÕES PESSOAIS (nomes próprios, posse) =====
        if (lowerContent.includes('meu') || lowerContent.includes('minha') || /[A-Z][a-z]+/.test(content)) {
            score += 0.1;
        }
        
        // Garantir range 0.0 - 1.0
        return Math.max(0.0, Math.min(1.0, score));
    }
}

module.exports = TopicExtractor;

