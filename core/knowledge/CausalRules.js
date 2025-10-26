/**
 * CausalRules - Base de conhecimento de relações causais
 * Mapeia causas → efeitos e observações → causas prováveis
 */

class CausalRules {
    /**
     * Regras de causa → consequências
     */
    static CAUSE_TO_EFFECTS = {
        // Clima
        'chuva': ['trânsito lento', 'ruas molhadas', 'alagamento', 'pessoas molhadas'],
        'sol forte': ['calor', 'sede', 'queimadura de sol'],
        'frio': ['gripe', 'usar casaco', 'preferir ficar em casa'],
        
        // Ações e consequências
        'não estudar': ['reprovar', 'não aprender', 'tirar nota baixa'],
        'estudar muito': ['passar na prova', 'aprender', 'tirar nota boa', 'cansaço'],
        'dormir tarde': ['cansaço', 'sono', 'produtividade baixa'],
        'exercício': ['cansaço', 'saúde melhor', 'disposição'],
        'comer muito': ['ganhar peso', 'ficar cheio', 'sono'],
        'não comer': ['fome', 'fraqueza', 'mal humor'],
        
        // Estados emocionais
        'estresse': ['ansiedade', 'irritação', 'insônia', 'dor de cabeça'],
        'felicidade': ['motivação', 'produtividade', 'energia'],
        'tristeza': ['desmotivação', 'isolamento', 'choro'],
        
        // Situações sociais
        'briga': ['raiva', 'distanciamento', 'tristeza', 'arrependimento'],
        'reconciliação': ['alívio', 'felicidade', 'paz'],
        'término': ['tristeza', 'solidão', 'liberdade'],
        
        // Trabalho/estudos
        'procrastinar': ['atraso', 'estresse', 'qualidade baixa', 'arrependimento'],
        'planejamento': ['organização', 'produtividade', 'menos estresse'],
        'deadline próximo': ['urgência', 'estresse', 'trabalho noturno'],
        
        // Saúde
        'doença': ['fraqueza', 'falta ao trabalho', 'medicação', 'descanso'],
        'lesão': ['dor', 'limitação física', 'repouso'],
        'insônia': ['cansaço', 'irritação', 'baixa concentração']
    };

    /**
     * Regras de efeitos → causas prováveis (raciocínio abdutivo)
     */
    static EFFECT_TO_CAUSES = {
        // Sintomas físicos
        'dor de cabeça': ['estresse', 'desidratação', 'sono ruim', 'gripe', 'enxaqueca'],
        'febre': ['gripe', 'covid', 'infecção', 'dengue'],
        'cansaço': ['dormir tarde', 'estresse', 'doença', 'exercício'],
        'fome': ['não comer', 'tempo sem comer', 'dieta'],
        
        // Estados emocionais
        'tristeza': ['término', 'briga', 'perda', 'solidão', 'decepção'],
        'ansiedade': ['prova próxima', 'deadline', 'medo', 'estresse', 'incerteza'],
        'raiva': ['injustiça', 'frustração', 'briga', 'traição'],
        'felicidade': ['conquista', 'boas notícias', 'encontro', 'surpresa positiva'],
        
        // Situações
        'trânsito lento': ['chuva', 'acidente', 'horário de pico', 'evento'],
        'atraso': ['trânsito', 'acordar tarde', 'imprevistos', 'procrastinação'],
        'nota baixa': ['não estudar', 'prova difícil', 'falta de atenção'],
        'nota alta': ['estudar muito', 'facilidade', 'sorte'],
        
        // Problemas
        'insônia': ['estresse', 'ansiedade', 'café', 'preocupação'],
        'falta de dinheiro': ['gastos altos', 'salário baixo', 'desemprego', 'imprevistos'],
        'briga': ['mal entendido', 'ciúmes', 'traição', 'estresse', 'diferenças']
    };

    /**
     * Palavras-chave que indicam causalidade
     */
    static CAUSAL_KEYWORDS = {
        causes: ['porque', 'por causa de', 'devido a', 'graças a', 'culpa de', 'resultado de'],
        effects: ['então', 'por isso', 'consequentemente', 'resultado', 'causou', 'gerou', 'levou a']
    };

    /**
     * Infere efeitos prováveis de uma causa
     */
    static inferEffects(cause) {
        const normalizedCause = this.normalizeConcept(cause);
        const effects = [];

        // Busca exata
        if (this.CAUSE_TO_EFFECTS[normalizedCause]) {
            effects.push(...this.CAUSE_TO_EFFECTS[normalizedCause]);
        }

        // Busca por palavras-chave contidas
        for (const [key, value] of Object.entries(this.CAUSE_TO_EFFECTS)) {
            if (normalizedCause.includes(key) || key.includes(normalizedCause)) {
                effects.push(...value);
            }
        }

        return [...new Set(effects)]; // Remove duplicatas
    }

    /**
     * Infere causas prováveis de um efeito observado
     */
    static inferCauses(effect) {
        const normalizedEffect = this.normalizeConcept(effect);
        const causes = [];

        // Busca exata
        if (this.EFFECT_TO_CAUSES[normalizedEffect]) {
            causes.push(...this.EFFECT_TO_CAUSES[normalizedEffect]);
        }

        // Busca por palavras-chave contidas
        for (const [key, value] of Object.entries(this.EFFECT_TO_CAUSES)) {
            if (normalizedEffect.includes(key) || key.includes(normalizedEffect)) {
                causes.push(...value);
            }
        }

        return [...new Set(causes)]; // Remove duplicatas
    }

    /**
     * Detecta relação causal explícita na mensagem
     */
    static detectCausalRelation(message) {
        const lower = message.toLowerCase();

        // Detectar "X porque Y"
        for (const keyword of this.CAUSAL_KEYWORDS.causes) {
            if (lower.includes(keyword)) {
                const parts = lower.split(keyword);
                if (parts.length >= 2) {
                    return {
                        type: 'explicit_cause',
                        effect: parts[0].trim(),
                        cause: parts[1].trim(),
                        confidence: 0.9
                    };
                }
            }
        }

        // Detectar "X então Y"
        for (const keyword of this.CAUSAL_KEYWORDS.effects) {
            if (lower.includes(keyword)) {
                const parts = lower.split(keyword);
                if (parts.length >= 2) {
                    return {
                        type: 'explicit_effect',
                        cause: parts[0].trim(),
                        effect: parts[1].trim(),
                        confidence: 0.9
                    };
                }
            }
        }

        return null;
    }

    /**
     * Normaliza conceito para busca
     */
    static normalizeConcept(concept) {
        return concept
            .toLowerCase()
            .trim()
            .replace(/[.,!?;]/g, '');
    }

    /**
     * Calcula probabilidade de uma relação causal
     */
    static getCausalProbability(cause, effect) {
        const effects = this.inferEffects(cause);
        if (effects.includes(effect)) {
            // Se está na base, probabilidade alta
            return 0.7 + (Math.random() * 0.2); // 0.7-0.9
        }
        return 0.1 + (Math.random() * 0.2); // 0.1-0.3 (incerto)
    }
}

module.exports = CausalRules;

