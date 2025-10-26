/**
 * ExpectationEngine - Gera expectativas e detecta surpresas
 * Compara eventos com o esperado para reagir apropriadamente
 */

const logger = require('../Logger');

class ExpectationEngine {
    constructor() {
        logger.debug('reasoning', 'ExpectationEngine inicializado');
    }

    /**
     * Analisa mensagem para expectativas e surpresas
     */
    analyze(message, context = {}) {
        const insights = {
            type: 'expectation',
            expectations: [],
            surprises: [],
            patterns: [],
            suggestions: [],
            confidence: 0
        };

        try {
            // 1. Formar expectativas baseadas no contexto
            if (context.activeMemory) {
                const expectations = this.formExpectations(context.activeMemory);
                insights.expectations = expectations;
            }

            // 2. Detectar surpresas comparando mensagem com expectativas
            if (insights.expectations.length > 0) {
                const surprises = this.detectSurprises(message, insights.expectations);
                
                if (surprises.length > 0) {
                    insights.surprises = surprises;
                    insights.confidence = 0.8;

                    // Gerar reações apropriadas
                    for (const surprise of surprises) {
                        const reaction = this.generateReaction(surprise);
                        if (reaction) {
                            insights.suggestions.push(reaction);
                        }
                    }
                }
            }

            // 3. Detectar padrões de comportamento
            if (context.history && context.history.length >= 5) {
                const patterns = this.detectBehaviorPatterns(context.history);
                if (patterns.length > 0) {
                    insights.patterns = patterns;
                    insights.confidence = Math.max(insights.confidence, 0.7);
                }
            }

            // 4. Verificar resultados inesperados
            const unexpectedResults = this.detectUnexpectedResults(message, context);
            if (unexpectedResults) {
                insights.surprises.push(unexpectedResults);
                insights.confidence = Math.max(insights.confidence, 0.75);
            }

        } catch (error) {
            logger.error('reasoning', 'Erro no ExpectationEngine:', error);
        }

        return insights;
    }

    /**
     * Forma expectativas baseadas no contexto ativo
     */
    formExpectations(activeMemory) {
        const expectations = [];

        // Se há tópico ativo, esperar continuação
        if (activeMemory.activeTopic) {
            expectations.push({
                type: 'topic_continuation',
                expected: `continuar falando sobre ${activeMemory.activeTopic}`,
                topic: activeMemory.activeTopic,
                confidence: 0.6
            });
        }

        // Se há intenção declarada, esperar ação
        if (activeMemory.declaredIntentions && activeMemory.declaredIntentions.length > 0) {
            for (const intention of activeMemory.declaredIntentions) {
                expectations.push({
                    type: 'follow_through',
                    expected: `seguir com: ${intention}`,
                    intention,
                    confidence: 0.7
                });
            }
        }

        // Se há sentimento, esperar consistência
        if (activeMemory.lastSentiment) {
            expectations.push({
                type: 'sentiment_consistency',
                expected: `manter tom ${activeMemory.lastSentiment}`,
                sentiment: activeMemory.lastSentiment,
                confidence: 0.5
            });
        }

        return expectations;
    }

    /**
     * Detecta surpresas comparando com expectativas
     */
    detectSurprises(message, expectations) {
        const surprises = [];
        const lower = message.toLowerCase();

        for (const expectation of expectations) {
            const deviation = this.measureDeviation(message, expectation);

            if (deviation.isSurprising) {
                surprises.push({
                    expectation: expectation.expected,
                    actual: message,
                    type: expectation.type,
                    polarity: deviation.polarity,
                    magnitude: deviation.magnitude,
                    confidence: deviation.confidence
                });
            }
        }

        return surprises;
    }

    /**
     * Mede desvio entre expectativa e realidade
     */
    measureDeviation(message, expectation) {
        const lower = message.toLowerCase();

        switch (expectation.type) {
        case 'topic_continuation':
            // Verificar se mudou de assunto abruptamente
            if (!lower.includes(expectation.topic.toLowerCase())) {
                return {
                    isSurprising: true,
                    polarity: 'neutral',
                    magnitude: 0.7,
                    confidence: 0.7,
                    reason: 'topic_change'
                };
            }
            break;

        case 'follow_through':
            // Verificar se executou ou desistiu da intenção
            if (this.containsSuccess(lower)) {
                return {
                    isSurprising: true,
                    polarity: 'positive',
                    magnitude: 0.8,
                    confidence: 0.8,
                    reason: 'positive_outcome'
                };
            }
            if (this.containsFailure(lower) || this.containsGiveUp(lower)) {
                return {
                    isSurprising: true,
                    polarity: 'negative',
                    magnitude: 0.6,
                    confidence: 0.7,
                    reason: 'gave_up'
                };
            }
            break;

        case 'sentiment_consistency':
            // Verificar mudança brusca de sentimento
            const currentSentiment = this.inferSentiment(message);
            if (currentSentiment && this.areOppositeSentiments(currentSentiment, expectation.sentiment)) {
                return {
                    isSurprising: true,
                    polarity: currentSentiment === 'positive' ? 'positive' : 'negative',
                    magnitude: 0.9,
                    confidence: 0.8,
                    reason: 'mood_shift'
                };
            }
            break;
        }

        return { isSurprising: false };
    }

    /**
     * Detecta padrões de comportamento no histórico
     */
    detectBehaviorPatterns(history) {
        const patterns = [];
        const recentMessages = history.slice(-10).filter(m => typeof m === 'string');

        // Padrão 1: Procrastinação (sempre diz "vou fazer" mas não faz)
        const intentions = recentMessages.filter(m => 
            m.toLowerCase().includes('vou') || m.toLowerCase().includes('vou fazer')
        );
        
        if (intentions.length >= 3) {
            patterns.push({
                type: 'procrastination',
                occurrences: intentions.length,
                confidence: 0.7,
                insight: 'Padrão de procrastinação detectado'
            });
        }

        // Padrão 2: Reclamações frequentes
        const complaints = recentMessages.filter(m => {
            const lower = m.toLowerCase();
            return lower.includes('problema') || lower.includes('ruim') || 
                   lower.includes('chato') || lower.includes('difícil');
        });

        if (complaints.length >= 3) {
            patterns.push({
                type: 'frequent_complaints',
                occurrences: complaints.length,
                confidence: 0.75,
                insight: 'Humor negativo recorrente'
            });
        }

        // Padrão 3: Entusiasmo seguido de desânimo
        const enthusiasm = recentMessages.filter(m => 
            this.containsSuccess(m.toLowerCase()) || this.containsExcitement(m.toLowerCase())
        ).length;
        
        const discouragement = recentMessages.filter(m =>
            this.containsFailure(m.toLowerCase()) || this.containsGiveUp(m.toLowerCase())
        ).length;

        if (enthusiasm >= 2 && discouragement >= 2) {
            patterns.push({
                type: 'mood_volatility',
                enthusiasm,
                discouragement,
                confidence: 0.65,
                insight: 'Oscilação entre entusiasmo e desânimo'
            });
        }

        return patterns;
    }

    /**
     * Detecta resultados inesperados
     */
    detectUnexpectedResults(message, context) {
        const lower = message.toLowerCase();

        // Resultado positivo inesperado
        if (this.containsSuccess(lower)) {
            // Verificar se havia negatividade prévia
            if (context.activeMemory && context.activeMemory.lastSentiment === 'negative') {
                return {
                    type: 'unexpected_success',
                    polarity: 'positive',
                    magnitude: 0.9,
                    confidence: 0.8,
                    message: 'Resultado positivo inesperado!'
                };
            }
        }

        // Resultado negativo inesperado
        if (this.containsFailure(lower)) {
            // Verificar se havia otimismo prévio
            if (context.activeMemory && context.activeMemory.lastSentiment === 'positive') {
                return {
                    type: 'unexpected_failure',
                    polarity: 'negative',
                    magnitude: 0.8,
                    confidence: 0.75,
                    message: 'Resultado negativo inesperado'
                };
            }
        }

        return null;
    }

    /**
     * Gera reação apropriada à surpresa
     */
    generateReaction(surprise) {
        switch (surprise.polarity) {
        case 'positive':
            return {
                type: 'celebrate',
                tone: 'enthusiastic',
                suggestion: 'Reagir com entusiasmo e comemoração',
                examples: ['Brabo!', 'Eita, que massa!', 'Top demais!']
            };

        case 'negative':
            return {
                type: 'empathy',
                tone: 'supportive',
                suggestion: 'Mostrar empatia e apoio',
                examples: ['Poxa, que chato', 'Entendo, mano', 'Vai dar certo na próxima']
            };

        case 'neutral':
            if (surprise.type === 'topic_change') {
                return {
                    type: 'acknowledge',
                    tone: 'curious',
                    suggestion: 'Reconhecer mudança de assunto',
                    examples: ['Ah, mudou de assunto?', 'Beleza, bora falar disso então']
                };
            }
            break;
        }

        return null;
    }

    /**
     * Verifica se contém sucesso/vitória
     */
    containsSuccess(text) {
        const successKeywords = [
            'passei', 'consegui', 'deu certo', 'funcionou', 'vitória',
            'sucesso', 'tirei 10', 'nota boa', 'aprovado', 'acertei'
        ];
        return successKeywords.some(kw => text.includes(kw));
    }

    /**
     * Verifica se contém falha/derrota
     */
    containsFailure(text) {
        const failureKeywords = [
            'reprovei', 'não consegui', 'deu errado', 'falhou', 'fracasso',
            'nota baixa', 'reprovado', 'errei', 'perdi'
        ];
        return failureKeywords.some(kw => text.includes(kw));
    }

    /**
     * Verifica se contém desistência
     */
    containsGiveUp(text) {
        const giveUpKeywords = [
            'desisti', 'não vou fazer', 'deixa pra lá', 'esquece',
            'não dá', 'impossível', 'não consigo'
        ];
        return giveUpKeywords.some(kw => text.includes(kw));
    }

    /**
     * Verifica se contém entusiasmo
     */
    containsExcitement(text) {
        const excitementKeywords = [
            'animado', 'empolgado', 'mal posso esperar', 'ansioso',
            'vou arrasar', 'vai dar certo', 'confiante'
        ];
        return excitementKeywords.some(kw => text.includes(kw));
    }

    /**
     * Infere sentimento da mensagem
     */
    inferSentiment(message) {
        const lower = message.toLowerCase();
        
        const positive = ['feliz', 'alegre', 'otimista', 'bem', 'legal', 'bom', 'ótimo'];
        const negative = ['triste', 'mal', 'ruim', 'péssimo', 'chato', 'difícil'];

        if (positive.some(kw => lower.includes(kw))) return 'positive';
        if (negative.some(kw => lower.includes(kw))) return 'negative';

        return null;
    }

    /**
     * Verifica se sentimentos são opostos
     */
    areOppositeSentiments(sent1, sent2) {
        return (sent1 === 'positive' && sent2 === 'negative') ||
               (sent1 === 'negative' && sent2 === 'positive');
    }

    /**
     * Formata insights para inclusão no prompt
     */
    formatForPrompt(insights) {
        if (insights.confidence < 0.6) return '';

        let formatted = '\n## EXPECTATIVAS E SURPRESAS:\n';

        if (insights.surprises.length > 0) {
            formatted += '- SURPRESAS DETECTADAS:\n';
            for (const surprise of insights.surprises) {
                if (surprise.polarity === 'positive') {
                    formatted += `  🎉 ${surprise.message || 'Resultado positivo inesperado!'}\n`;
                } else if (surprise.polarity === 'negative') {
                    formatted += `  😔 ${surprise.message || 'Resultado negativo inesperado'}\n`;
                }
            }
        }

        if (insights.patterns.length > 0) {
            formatted += '- Padrões de comportamento:\n';
            for (const pattern of insights.patterns) {
                formatted += `  • ${pattern.insight} (${pattern.occurrences}x)\n`;
            }
        }

        if (insights.suggestions.length > 0) {
            formatted += '- Tom sugerido:\n';
            for (const sug of insights.suggestions) {
                formatted += `  • ${sug.tone}: ${sug.suggestion}\n`;
            }
        }

        return formatted;
    }
}

module.exports = ExpectationEngine;

