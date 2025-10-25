/**
 * PronounResolver - Resolução de pronomes para entidades concretas
 * Resolve ele/ela/isso/esse/essa/aquilo/disso baseado no contexto
 */

const logger = require('./Logger');

class PronounResolver {
    constructor() {
        // Pronomes que podem ser resolvidos
        this.pronouns = {
            pessoas: ['ele', 'ela', 'eles', 'elas'],
            objetos: ['isso', 'esse', 'essa', 'esses', 'essas', 'aquilo', 'aquele', 'aquela', 'disso', 'dele', 'dela']
        };
        
        // Indicadores de gênero em português
        this.genderIndicators = {
            masculine: ['o', 'ele', 'dele', 'aquele', 'esse'],
            feminine: ['a', 'ela', 'dela', 'aquela', 'essa']
        };
    }
    
    /**
     * Resolve pronomes em um texto baseado no contexto
     * @param {string} text - Texto com pronomes
     * @param {Object} contextState - Estado do contexto com entidades
     * @returns {Object} { resolvedText, resolutions: [{pronoun, entity, confidence}] }
     */
    resolve(text, contextState) {
        if (!text || !contextState) {
            return { resolvedText: text, resolutions: [] };
        }
        
        const pronounsInText = this.getPronounsInText(text);
        
        if (pronounsInText.length === 0) {
            return { resolvedText: text, resolutions: [] };
        }
        
        let resolvedText = text;
        const resolutions = [];
        
        pronounsInText.forEach(pronoun => {
            const resolution = this.resolveSinglePronoun(pronoun, contextState);
            
            if (resolution.entity) {
                resolutions.push(resolution);
                
                // Substituir pronome por entidade no texto (opcional, para análise)
                // Não substituímos no texto final para manter naturalidade
                logger.debug('pronoun-resolver', `Resolvido '${pronoun}' → '${resolution.entity}'`);
            }
        });
        
        return { resolvedText, resolutions };
    }
    
    /**
     * Resolve um único pronome
     * @param {string} pronoun - Pronome a resolver
     * @param {Object} contextState - Estado do contexto
     * @returns {Object} { pronoun, entity, type, confidence }
     */
    resolveSinglePronoun(pronoun, contextState) {
        const lowerPronoun = pronoun.toLowerCase();
        
        // Determinar tipo de pronome (pessoa ou objeto)
        const isPerson = this.pronouns.pessoas.includes(lowerPronoun);
        const isObject = this.pronouns.objetos.includes(lowerPronoun);
        
        if (isPerson) {
            return this.resolvePersonPronoun(lowerPronoun, contextState);
        } else if (isObject) {
            return this.resolveObjectPronoun(lowerPronoun, contextState);
        }
        
        return { pronoun, entity: null, type: 'unknown', confidence: 0 };
    }
    
    /**
     * Resolve pronome de pessoa (ele/ela)
     */
    resolvePersonPronoun(pronoun, contextState) {
        const entidadesAtivas = contextState.entidades_ativas || {};
        const pessoas = entidadesAtivas.pessoas || [];
        
        if (pessoas.length === 0) {
            return { pronoun, entity: null, type: 'pessoa', confidence: 0 };
        }
        
        // Se tem apenas uma pessoa no contexto, é ela
        if (pessoas.length === 1) {
            return {
                pronoun,
                entity: pessoas[0],
                type: 'pessoa',
                confidence: 0.9
            };
        }
        
        // Se tem múltiplas pessoas, retornar a mais recente
        // (assumindo que o array está ordenado por recência)
        return {
            pronoun,
            entity: pessoas[pessoas.length - 1],
            type: 'pessoa',
            confidence: 0.7
        };
    }
    
    /**
     * Resolve pronome de objeto (isso/esse/aquilo)
     */
    resolveObjectPronoun(pronoun, contextState) {
        const entidadesAtivas = contextState.entidades_ativas || {};
        
        // Tentar eventos primeiro (geralmente mais relevantes)
        const eventos = entidadesAtivas.eventos || [];
        if (eventos.length > 0) {
            const ultimoEvento = eventos[eventos.length - 1];
            return {
                pronoun,
                entity: ultimoEvento.tipo || ultimoEvento,
                type: 'evento',
                confidence: 0.8
            };
        }
        
        // Depois objetos
        const objetos = entidadesAtivas.objetos || [];
        if (objetos.length > 0) {
            return {
                pronoun,
                entity: objetos[objetos.length - 1],
                type: 'objeto',
                confidence: 0.7
            };
        }
        
        // Por último, tópico ativo
        const topicoAtivo = contextState.topico_ativo;
        if (topicoAtivo) {
            return {
                pronoun,
                entity: topicoAtivo,
                type: 'topico',
                confidence: 0.6
            };
        }
        
        return { pronoun, entity: null, type: 'objeto', confidence: 0 };
    }
    
    /**
     * Detecta pronomes presentes em um texto
     * @param {string} text - Texto para análise
     * @returns {Array<string>} Lista de pronomes encontrados
     */
    getPronounsInText(text) {
        if (!text) return [];
        
        const lowerText = text.toLowerCase();
        const found = [];
        
        // Combinar todos os pronomes
        const allPronouns = [
            ...this.pronouns.pessoas,
            ...this.pronouns.objetos
        ];
        
        // Buscar cada pronome como palavra completa
        allPronouns.forEach(pronoun => {
            const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
            if (regex.test(lowerText)) {
                found.push(pronoun);
            }
        });
        
        return found;
    }
    
    /**
     * Cria texto explicativo das resoluções (para incluir no prompt)
     * @param {Array} resolutions - Array de resoluções
     * @returns {string} Texto formatado
     */
    formatResolutions(resolutions) {
        if (resolutions.length === 0) {
            return '';
        }
        
        const lines = resolutions
            .filter(r => r.entity && r.confidence > 0.5)
            .map(r => `- "${r.pronoun}" refere-se a: ${r.entity} (${r.type})`)
            .join('\n');
        
        if (lines) {
            return `\n=== PRONOMES RESOLVIDOS ===\n${lines}\n`;
        }
        
        return '';
    }
    
    /**
     * Verifica se um texto contém pronomes ambíguos
     * @param {string} text - Texto para verificar
     * @returns {boolean} True se contém pronomes
     */
    hasPronouns(text) {
        return this.getPronounsInText(text).length > 0;
    }
    
    /**
     * Obtém estatísticas de resolução
     * @param {Array} resolutions - Array de resoluções
     * @returns {Object} Estatísticas
     */
    getResolutionStats(resolutions) {
        const total = resolutions.length;
        const resolved = resolutions.filter(r => r.entity).length;
        const avgConfidence = resolutions
            .filter(r => r.entity)
            .reduce((sum, r) => sum + r.confidence, 0) / (resolved || 1);
        
        return {
            total,
            resolved,
            unresolved: total - resolved,
            avgConfidence: Math.round(avgConfidence * 100) / 100,
            success_rate: total > 0 ? Math.round((resolved / total) * 100) : 0
        };
    }
}

module.exports = PronounResolver;

