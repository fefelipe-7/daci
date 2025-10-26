/**
 * EntityRecognizer - Reconhecimento de entidades usando Compromise
 * Detecta pessoas, lugares, eventos, objetos e informações temporais
 */

const nlp = require('compromise');
nlp.extend(require('compromise-numbers'));
const logger = require('./Logger');

class EntityRecognizer {
    constructor() {
        // Cache de entidades por conversa (chave: userId)
        this.entityCache = new Map();
        this.CACHE_TTL = 60 * 60 * 1000; // 1 hora
        
        // Padrões de eventos personalizados para português
        this.eventPatterns = [
            { pattern: /\b(festa|festinha|festança)\s+(?:da|do|de)?\s*(\w+)/i, type: 'festa' },
            { pattern: /\b(prova|exame|teste)\s+(?:de)?\s*(\w+)/i, type: 'prova' },
            { pattern: /\b(jogo|partida|match)\s+(?:de|do)?\s*(\w+)/i, type: 'jogo' },
            { pattern: /\b(show|concerto)\s+(?:da|do|de)?\s*(\w+)/i, type: 'show' },
            { pattern: /\b(encontro|reunião)\s+(?:com)?\s*(\w+)/i, type: 'reunião' },
            { pattern: /\b(aniversário|niver)\s+(?:da|do|de)?\s*(\w+)/i, type: 'aniversário' }
        ];
        
        // Marcas e produtos conhecidos
        this.knownObjects = [
            'ps5', 'ps4', 'xbox', 'nintendo', 'switch',
            'iphone', 'samsung', 'xiaomi', 'motorola',
            'playstation', 'macbook', 'ipad',
            'corolla', 'civic', 'gol', 'uno',
            'netflix', 'spotify', 'discord', 'whatsapp'
        ];
        
        logger.info('entity-recognizer', 'EntityRecognizer inicializado');
    }
    
    /**
     * Extrai todas as entidades de um texto
     * @param {string} text - Texto para análise
     * @param {string} userId - ID do usuário (para cache)
     * @returns {Object} Entidades detectadas estruturadas
     */
    extractEntities(text, userId = null) {
        if (!text || text.trim() === '') {
            return this.getEmptyEntities();
        }
        
        const doc = nlp(text);
        
        const entities = {
            pessoas: this.extractPeople(doc, text),
            lugares: this.extractPlaces(doc, text),
            eventos: this.extractEvents(text),
            objetos: this.extractObjects(text),
            temporal: this.extractTemporal(doc, text),
            timestamp: Date.now()
        };
        
        // Atualizar cache se userId fornecido
        if (userId) {
            this.updateCache(userId, entities);
        }
        
        // Log para debug
        const totalEntities = Object.values(entities)
            .filter(v => Array.isArray(v))
            .reduce((sum, arr) => sum + arr.length, 0);
            
        if (totalEntities > 0) {
            logger.debug('entity-recognizer', `Detectadas ${totalEntities} entidades: ${JSON.stringify(entities)}`);
        }
        
        return entities;
    }
    
    /**
     * Extrai nomes de pessoas
     */
    extractPeople(doc, text) {
        const people = new Set();
        
        // Usar compromise para detectar pessoas
        const detected = doc.people().out('array');
        detected.forEach(person => {
            // Normalizar nome
            const normalized = person.trim().toLowerCase();
            if (normalized.length > 1 && normalized.length < 20) {
                people.add(normalized);
            }
        });
        
        // Padrões adicionais para português (nomes próprios comuns)
        const namePatterns = [
            /\b([A-Z][a-zà-ú]+)\s+(?:sumiu|apareceu|falou|disse|fez|tá|está)/i,
            /\b(?:o|a)\s+([A-Z][a-zà-ú]+)\s+(?:me|te|nos)/i
        ];
        
        namePatterns.forEach(pattern => {
            const match = text.match(pattern);
            if (match && match[1]) {
                people.add(match[1].toLowerCase());
            }
        });
        
        return Array.from(people);
    }
    
    /**
     * Extrai lugares
     */
    extractPlaces(doc, text) {
        const places = new Set();
        
        // Usar compromise
        const detected = doc.places().out('array');
        detected.forEach(place => {
            const normalized = place.trim().toLowerCase();
            if (normalized.length > 2) {
                places.add(normalized);
            }
        });
        
        // Lugares comuns em português
        const commonPlaces = ['shopping', 'praia', 'parque', 'escola', 'faculdade', 'trabalho', 'casa', 'cinema', 'restaurante', 'bar', 'clube'];
        const lowerText = text.toLowerCase();
        
        commonPlaces.forEach(place => {
            if (lowerText.includes(place)) {
                places.add(place);
            }
        });
        
        return Array.from(places);
    }
    
    /**
     * Extrai eventos usando padrões customizados
     */
    extractEvents(text) {
        const events = [];
        
        this.eventPatterns.forEach(({ pattern, type }) => {
            const match = text.match(pattern);
            if (match) {
                events.push({
                    tipo: type,
                    de: match[2] ? match[2].toLowerCase() : null,
                    mencao_completa: match[0]
                });
            }
        });
        
        return events;
    }
    
    /**
     * Extrai objetos/produtos mencionados
     */
    extractObjects(text) {
        const objects = new Set();
        const lowerText = text.toLowerCase();
        
        // Verificar objetos conhecidos
        this.knownObjects.forEach(obj => {
            if (lowerText.includes(obj)) {
                objects.add(obj);
            }
        });
        
        // Padrões genéricos
        const objectPatterns = [
            /\b(celular|telefone|computador|notebook|tv|carro|moto|bike)\b/gi
        ];
        
        objectPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                objects.add(match[1].toLowerCase());
            }
        });
        
        return Array.from(objects);
    }
    
    /**
     * Extrai informações temporais
     */
    extractTemporal(doc, text) {
        const temporal = new Set();
        
        // Tentar usar compromise para datas (pode não estar disponível)
        try {
            if (doc.dates && typeof doc.dates === 'function') {
                const dates = doc.dates().out('array');
                dates.forEach(date => {
                    temporal.add(date.toLowerCase());
                });
            }
        } catch (error) {
            // doc.dates() não disponível, usar apenas padrões manuais
            logger.debug('entity-recognizer', 'doc.dates() não disponível, usando padrões manuais');
        }
        
        // Expressões temporais comuns em português
        const temporalPatterns = [
            /\b(hoje|amanhã|ontem|depois|agora|já|logo|dps)\b/gi,
            /\b(semana que vem|mês que vem|ano que vem|próximo|próxima)\b/gi,
            /\b(segunda|terça|quarta|quinta|sexta|sábado|sabado|domingo)\b/gi,
            /\b(manhã|tarde|noite|madrugada)\b/gi,
            /\b(daqui a|em)\s+\d+\s+(hora|horas|dia|dias|semana|semanas)\b/gi
        ];
        
        temporalPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                temporal.add(match[0].toLowerCase());
            }
        });
        
        return Array.from(temporal);
    }
    
    /**
     * Atualiza cache de entidades para um usuário
     */
    updateCache(userId, entities) {
        const existing = this.entityCache.get(userId);
        
        if (!existing) {
            this.entityCache.set(userId, {
                entities,
                expiresAt: Date.now() + this.CACHE_TTL
            });
            return;
        }
        
        // Merge com entidades existentes
        const merged = {
            pessoas: [...new Set([...existing.entities.pessoas, ...entities.pessoas])],
            lugares: [...new Set([...existing.entities.lugares, ...entities.lugares])],
            eventos: [...existing.entities.eventos, ...entities.eventos],
            objetos: [...new Set([...existing.entities.objetos, ...entities.objetos])],
            temporal: [...new Set([...existing.entities.temporal, ...entities.temporal])],
            timestamp: Date.now()
        };
        
        this.entityCache.set(userId, {
            entities: merged,
            expiresAt: Date.now() + this.CACHE_TTL
        });
    }
    
    /**
     * Obtém entidades cacheadas de um usuário
     */
    getCachedEntities(userId) {
        const cached = this.entityCache.get(userId);
        
        if (!cached) return null;
        
        // Verificar se expirou
        if (Date.now() > cached.expiresAt) {
            this.entityCache.delete(userId);
            return null;
        }
        
        return cached.entities;
    }
    
    /**
     * Limpa cache de um usuário
     */
    clearCache(userId) {
        this.entityCache.delete(userId);
    }
    
    /**
     * Retorna estrutura vazia de entidades
     */
    getEmptyEntities() {
        return {
            pessoas: [],
            lugares: [],
            eventos: [],
            objetos: [],
            temporal: [],
            timestamp: Date.now()
        };
    }
    
    /**
     * Verifica se há entidades significativas
     */
    hasSignificantEntities(entities) {
        return entities.pessoas.length > 0 || 
               entities.eventos.length > 0 || 
               entities.lugares.length > 0;
    }
}

module.exports = EntityRecognizer;

