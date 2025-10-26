/**
 * CausalReasoner - Raciocínio sobre causa e efeito
 * Identifica relações causais, infere consequências e explica causas
 */

const CausalRules = require('../knowledge/CausalRules');
const logger = require('../Logger');

class CausalReasoner {
    constructor() {
        this.causalRules = CausalRules;
        logger.debug('reasoning', 'CausalReasoner inicializado');
    }

    /**
     * Analisa mensagem para raciocínio causal
     */
    analyze(message, context = {}) {
        const insights = {
            type: 'causal',
            explicitRelation: null,
            inferredEffects: [],
            inferredCauses: [],
            warnings: [],
            suggestions: [],
            confidence: 0
        };

        try {
            // 1. Detectar relação causal explícita
            const explicitRelation = this.causalRules.detectCausalRelation(message);
            if (explicitRelation) {
                insights.explicitRelation = explicitRelation;
                insights.confidence = explicitRelation.confidence;
                logger.debug('reasoning', `Relação causal explícita: ${explicitRelation.cause} → ${explicitRelation.effect}`);
            }

            // 2. Inferir efeitos prováveis de causas mencionadas
            const effects = this.inferEffectsFromMessage(message);
            if (effects.length > 0) {
                insights.inferredEffects = effects;
                insights.confidence = Math.max(insights.confidence, 0.7);
                
                // Gerar warnings se efeitos negativos
                for (const effect of effects) {
                    if (this.isNegativeEffect(effect.effect)) {
                        insights.warnings.push({
                            type: 'negative_consequence',
                            cause: effect.cause,
                            effect: effect.effect,
                            message: `Cuidado: ${effect.cause} pode levar a ${effect.effect}`
                        });
                    }
                }
            }

            // 3. Inferir causas prováveis de efeitos observados
            const causes = this.inferCausesFromMessage(message);
            if (causes.length > 0) {
                insights.inferredCauses = causes;
                insights.confidence = Math.max(insights.confidence, 0.6);
                
                // Gerar sugestões baseadas em causas
                for (const causeData of causes) {
                    const suggestion = this.generateSuggestionFromCause(causeData);
                    if (suggestion) {
                        insights.suggestions.push(suggestion);
                    }
                }
            }

            // 4. Verificar contexto para padrões causais recorrentes
            if (context.history && context.history.length > 0) {
                const patterns = this.detectCausalPatterns(context.history);
                if (patterns.length > 0) {
                    insights.patterns = patterns;
                }
            }

        } catch (error) {
            logger.error('reasoning', 'Erro no CausalReasoner:', error);
        }

        return insights;
    }

    /**
     * Infere efeitos prováveis de causas na mensagem
     */
    inferEffectsFromMessage(message) {
        const effects = [];
        const words = message.toLowerCase().split(/\s+/);
        const phrases = this.extractPhrases(message);

        // Testar palavras individuais e frases
        const testConcepts = [...words, ...phrases];

        for (const concept of testConcepts) {
            const possibleEffects = this.causalRules.inferEffects(concept);
            
            if (possibleEffects.length > 0) {
                // Pegar top 3 efeitos mais relevantes
                const topEffects = possibleEffects.slice(0, 3);
                
                for (const effect of topEffects) {
                    const probability = this.causalRules.getCausalProbability(concept, effect);
                    
                    if (probability > 0.5) {
                        effects.push({
                            cause: concept,
                            effect,
                            probability,
                            confidence: probability
                        });
                    }
                }
            }
        }

        // Remover duplicatas e ordenar por probabilidade
        const uniqueEffects = this.deduplicateEffects(effects);
        return uniqueEffects.sort((a, b) => b.probability - a.probability).slice(0, 5);
    }

    /**
     * Infere causas prováveis de efeitos na mensagem
     */
    inferCausesFromMessage(message) {
        const causes = [];
        const words = message.toLowerCase().split(/\s+/);
        const phrases = this.extractPhrases(message);

        const testConcepts = [...words, ...phrases];

        for (const concept of testConcepts) {
            const possibleCauses = this.causalRules.inferCauses(concept);
            
            if (possibleCauses.length > 0) {
                // Pegar top 3 causas mais prováveis
                const topCauses = possibleCauses.slice(0, 3);
                
                for (const cause of topCauses) {
                    causes.push({
                        effect: concept,
                        cause,
                        probability: 0.6 + Math.random() * 0.3, // 0.6-0.9
                        confidence: 0.6
                    });
                }
            }
        }

        // Remover duplicatas e ordenar por probabilidade
        const uniqueCauses = this.deduplicateCauses(causes);
        return uniqueCauses.sort((a, b) => b.probability - a.probability).slice(0, 5);
    }

    /**
     * Detecta padrões causais recorrentes no histórico
     */
    detectCausalPatterns(history) {
        const patterns = [];
        const recentMessages = history.slice(-10); // Últimas 10 mensagens

        // Procurar por "sempre que X, acontece Y"
        const causeCount = new Map();

        for (const msg of recentMessages) {
            if (typeof msg !== 'string') continue;
            
            const relation = this.causalRules.detectCausalRelation(msg);
            if (relation) {
                const key = `${relation.cause}→${relation.effect}`;
                causeCount.set(key, (causeCount.get(key) || 0) + 1);
            }
        }

        // Se alguma relação aparece 2+ vezes, é um padrão
        for (const [relation, count] of causeCount.entries()) {
            if (count >= 2) {
                const [cause, effect] = relation.split('→');
                patterns.push({
                    cause,
                    effect,
                    occurrences: count,
                    type: 'recurring_pattern',
                    confidence: Math.min(0.9, 0.5 + (count * 0.2))
                });
            }
        }

        return patterns;
    }

    /**
     * Verifica se efeito é negativo
     */
    isNegativeEffect(effect) {
        const negativeKeywords = [
            'reprovar', 'falhar', 'erro', 'problema', 'dor', 'doença',
            'tristeza', 'ansiedade', 'estresse', 'atraso', 'prejuízo',
            'perda', 'mal', 'ruim', 'negativo', 'difícil'
        ];

        const lower = effect.toLowerCase();
        return negativeKeywords.some(kw => lower.includes(kw));
    }

    /**
     * Gera sugestão baseada em causa inferida
     */
    generateSuggestionFromCause(causeData) {
        const { effect, cause, probability } = causeData;

        if (probability < 0.6) return null;

        // Se a causa é controlável, sugerir ação
        const controllableCauses = [
            'não estudar', 'procrastinar', 'dormir tarde', 'não comer',
            'estresse', 'falta de planejamento'
        ];

        if (controllableCauses.some(c => cause.includes(c))) {
            return {
                type: 'actionable',
                cause,
                effect,
                suggestion: `Para evitar ${effect}, considere trabalhar em ${cause}`,
                confidence: probability
            };
        }

        return null;
    }

    /**
     * Extrai frases de 2-3 palavras da mensagem
     */
    extractPhrases(message) {
        const words = message.toLowerCase().split(/\s+/);
        const phrases = [];

        // Bigramas (2 palavras)
        for (let i = 0; i < words.length - 1; i++) {
            phrases.push(`${words[i]} ${words[i + 1]}`);
        }

        // Trigramas (3 palavras)
        for (let i = 0; i < words.length - 2; i++) {
            phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }

        return phrases;
    }

    /**
     * Remove efeitos duplicados
     */
    deduplicateEffects(effects) {
        const seen = new Set();
        return effects.filter(e => {
            const key = `${e.cause}→${e.effect}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Remove causas duplicadas
     */
    deduplicateCauses(causes) {
        const seen = new Set();
        return causes.filter(c => {
            const key = `${c.cause}→${c.effect}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Formata insights para inclusão no prompt
     */
    formatForPrompt(insights) {
        if (insights.confidence < 0.5) return '';

        let formatted = '\n## RACIOCÍNIO CAUSAL:\n';

        if (insights.explicitRelation) {
            const rel = insights.explicitRelation;
            formatted += `- Relação explícita: "${rel.cause}" causa "${rel.effect}"\n`;
        }

        if (insights.inferredEffects.length > 0) {
            formatted += '- Possíveis consequências:\n';
            for (const eff of insights.inferredEffects.slice(0, 3)) {
                formatted += `  • ${eff.cause} pode levar a ${eff.effect} (${Math.round(eff.probability * 100)}%)\n`;
            }
        }

        if (insights.warnings.length > 0) {
            formatted += '- AVISOS:\n';
            for (const warn of insights.warnings.slice(0, 2)) {
                formatted += `  ⚠️ ${warn.message}\n`;
            }
        }

        if (insights.suggestions.length > 0) {
            formatted += '- Sugestões:\n';
            for (const sug of insights.suggestions.slice(0, 2)) {
                formatted += `  💡 ${sug.suggestion}\n`;
            }
        }

        return formatted;
    }
}

module.exports = CausalReasoner;

