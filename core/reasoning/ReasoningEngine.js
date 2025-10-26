/**
 * ReasoningEngine - Orquestrador de raciocínio lógico
 * Coordena todos os módulos de raciocínio e gera insights integrados
 */

const CausalReasoner = require('./CausalReasoner');
const TemporalReasoner = require('./TemporalReasoner');
const ContradictionDetector = require('./ContradictionDetector');
const ExpectationEngine = require('./ExpectationEngine');
const GoalPlanner = require('./GoalPlanner');
const logger = require('../Logger');

class ReasoningEngine {
    constructor() {
        // Inicializar todos os reasoners
        this.causalReasoner = new CausalReasoner();
        this.temporalReasoner = new TemporalReasoner();
        this.contradictionDetector = new ContradictionDetector();
        this.expectationEngine = new ExpectationEngine();
        this.goalPlanner = new GoalPlanner();
        
        // Configurações
        this.enabledReasoners = {
            causal: true,
            temporal: true,
            contradiction: true,
            expectation: true,
            goalPlanning: true
        };
        
        logger.info('reasoning', '🧠 ReasoningEngine inicializado com 5 módulos ativos');
    }

    /**
     * Analisa mensagem usando todos os reasoners
     * @param {string} message - Mensagem do usuário
     * @param {Object} context - Contexto da conversa
     * @returns {Object} Insights de raciocínio integrados
     */
    analyze(message, context = {}) {
        const startTime = Date.now();
        const results = {
            causal: null,
            temporal: null,
            contradiction: null,
            expectation: null,
            goalPlanning: null,
            integrated: {
                priorities: [],
                warnings: [],
                suggestions: [],
                tone: null,
                urgency: 'normal'
            },
            metadata: {
                processingTime: 0,
                activeReasoners: 0,
                confidence: 0
            }
        };

        try {
            // 1. Executar todos os reasoners em paralelo (simulado com síncronos)
            if (this.enabledReasoners.causal) {
                results.causal = this.causalReasoner.analyze(message, context);
                if (results.causal.confidence > 0.5) results.metadata.activeReasoners++;
            }

            if (this.enabledReasoners.temporal) {
                results.temporal = this.temporalReasoner.analyze(message, context);
                if (results.temporal.confidence > 0.5) results.metadata.activeReasoners++;
            }

            if (this.enabledReasoners.contradiction) {
                results.contradiction = this.contradictionDetector.analyze(message, context);
                if (results.contradiction.confidence > 0.5) results.metadata.activeReasoners++;
            }

            if (this.enabledReasoners.expectation) {
                results.expectation = this.expectationEngine.analyze(message, context);
                if (results.expectation.confidence > 0.5) results.metadata.activeReasoners++;
            }

            if (this.enabledReasoners.goalPlanning) {
                results.goalPlanning = this.goalPlanner.analyze(message, context);
                if (results.goalPlanning.confidence > 0.5) results.metadata.activeReasoners++;
            }

            // 2. Integrar insights de todos os reasoners
            results.integrated = this.integrateInsights(results);

            // 3. Calcular confiança global
            results.metadata.confidence = this.calculateGlobalConfidence(results);

            // 4. Logging
            results.metadata.processingTime = Date.now() - startTime;
            logger.debug('reasoning', `Raciocínio completo em ${results.metadata.processingTime}ms (${results.metadata.activeReasoners} reasoners ativos)`);

        } catch (error) {
            logger.error('reasoning', 'Erro no ReasoningEngine:', error);
        }

        return results;
    }

    /**
     * Integra insights de todos os reasoners
     */
    integrateInsights(results) {
        const integrated = {
            priorities: [],
            warnings: [],
            suggestions: [],
            tone: null,
            urgency: 'normal',
            keyInsights: []
        };

        // ===== PRIORIDADES =====
        
        // Temporal: Se há deadline urgente, prioridade máxima
        if (results.temporal && results.temporal.deadline) {
            const urgency = results.temporal.deadline.urgency;
            
            if (urgency === 'crítico' || urgency === 'urgente') {
                integrated.priorities.push({
                    type: 'time_critical',
                    priority: 'critical',
                    source: 'temporal',
                    message: `URGENTE: Apenas ${results.temporal.deadline.hoursRemaining.toFixed(1)}h até deadline`
                });
                integrated.urgency = urgency;
            }
        }

        // Goal Planning: Se há objetivo detectado, priorizar próxima ação
        if (results.goalPlanning && results.goalPlanning.nextActions.length > 0) {
            integrated.priorities.push({
                type: 'goal_action',
                priority: 'high',
                source: 'goalPlanning',
                message: results.goalPlanning.nextActions[0].action
            });
        }

        // ===== WARNINGS =====
        
        // Causal: Consequências negativas
        if (results.causal && results.causal.warnings.length > 0) {
            for (const warn of results.causal.warnings.slice(0, 2)) {
                integrated.warnings.push({
                    type: 'consequence',
                    severity: 'medium',
                    source: 'causal',
                    message: warn.message
                });
            }
        }

        // Contradiction: Inconsistências
        if (results.contradiction && results.contradiction.contradictions.length > 0) {
            integrated.warnings.push({
                type: 'contradiction',
                severity: 'low',
                source: 'contradiction',
                message: 'Detectei contradição com algo que você disse antes'
            });
        }

        // Temporal: Tempo insuficiente
        if (results.temporal && results.temporal.warnings.length > 0) {
            for (const warn of results.temporal.warnings) {
                integrated.warnings.push({
                    type: 'time_warning',
                    severity: warn.urgency === 'crítico' ? 'high' : 'medium',
                    source: 'temporal',
                    message: warn.message
                });
            }
        }

        // ===== SUGGESTIONS =====
        
        // Causal: Sugestões de ação
        if (results.causal && results.causal.suggestions.length > 0) {
            for (const sug of results.causal.suggestions.slice(0, 2)) {
                integrated.suggestions.push({
                    type: 'actionable',
                    source: 'causal',
                    message: sug.suggestion,
                    confidence: sug.confidence
                });
            }
        }

        // Temporal: Gestão de tempo
        if (results.temporal && results.temporal.suggestions.length > 0) {
            for (const sug of results.temporal.suggestions) {
                integrated.suggestions.push({
                    type: 'time_management',
                    source: 'temporal',
                    message: sug.message,
                    priority: sug.priority
                });
            }
        }

        // Goal Planning: Próximos passos
        if (results.goalPlanning && results.goalPlanning.nextActions.length > 0) {
            for (const action of results.goalPlanning.nextActions) {
                integrated.suggestions.push({
                    type: 'next_step',
                    source: 'goalPlanning',
                    message: action.message || `Passo ${action.stepNumber}: ${action.action}`,
                    confidence: 0.8
                });
            }
        }

        // ===== TOM (TONE) =====
        
        // Expectation: Se há surpresa, ajustar tom
        if (results.expectation && results.expectation.surprises.length > 0) {
            const surprise = results.expectation.surprises[0];
            
            if (surprise.polarity === 'positive') {
                integrated.tone = 'enthusiastic';
                integrated.keyInsights.push('User teve resultado positivo inesperado - comemorar!');
            } else if (surprise.polarity === 'negative') {
                integrated.tone = 'supportive';
                integrated.keyInsights.push('User teve resultado negativo - mostrar empatia');
            }
        }

        // Temporal: Se urgência alta, tom direto e focado
        if (integrated.urgency === 'crítico' || integrated.urgency === 'urgente') {
            integrated.tone = integrated.tone || 'urgent_focused';
            integrated.keyInsights.push('Situação urgente - ser direto e objetivo');
        }

        // Contradiction: Tom de curiosidade/questionamento
        if (results.contradiction && results.contradiction.contradictions.length > 0) {
            integrated.tone = integrated.tone || 'curious';
            integrated.keyInsights.push('Contradição detectada - questionar gentilmente');
        }

        // ===== KEY INSIGHTS =====
        
        // Resumir os principais insights
        if (results.causal && results.causal.inferredEffects.length > 0) {
            const topEffect = results.causal.inferredEffects[0];
            integrated.keyInsights.push(`Causa-efeito: "${topEffect.cause}" pode levar a "${topEffect.effect}"`);
        }

        if (results.goalPlanning && results.goalPlanning.detectedGoals.length > 0) {
            const goal = results.goalPlanning.detectedGoals[0];
            integrated.keyInsights.push(`Objetivo: ${goal.text} (${goal.duration})`);
        }

        if (results.expectation && results.expectation.patterns.length > 0) {
            const pattern = results.expectation.patterns[0];
            integrated.keyInsights.push(`Padrão: ${pattern.insight}`);
        }

        return integrated;
    }

    /**
     * Calcula confiança global baseada em todos os reasoners
     */
    calculateGlobalConfidence(results) {
        const confidences = [];

        if (results.causal && results.causal.confidence > 0) {
            confidences.push(results.causal.confidence);
        }
        if (results.temporal && results.temporal.confidence > 0) {
            confidences.push(results.temporal.confidence);
        }
        if (results.contradiction && results.contradiction.confidence > 0) {
            confidences.push(results.contradiction.confidence);
        }
        if (results.expectation && results.expectation.confidence > 0) {
            confidences.push(results.expectation.confidence);
        }
        if (results.goalPlanning && results.goalPlanning.confidence > 0) {
            confidences.push(results.goalPlanning.confidence);
        }

        if (confidences.length === 0) return 0;

        // Média ponderada (dar mais peso aos reasoners com maior confiança)
        const sortedConfidences = confidences.sort((a, b) => b - a);
        const weights = sortedConfidences.map((_, i) => 1 / (i + 1)); // 1, 1/2, 1/3, ...
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        const weightedSum = sortedConfidences.reduce((sum, conf, i) => sum + conf * weights[i], 0);
        return weightedSum / totalWeight;
    }

    /**
     * Formata todos os insights para o prompt (versão compacta)
     */
    formatForPrompt(reasoningResults) {
        if (!reasoningResults || reasoningResults.metadata.confidence < 0.5) {
            return '';
        }

        let formatted = '\n═══════════════════════════════════════\n';
        formatted += '🧠 INSIGHTS DE RACIOCÍNIO LÓGICO:\n';
        formatted += '═══════════════════════════════════════\n';

        const integrated = reasoningResults.integrated;

        // 1. Key Insights
        if (integrated.keyInsights.length > 0) {
            formatted += '\n📌 CONTEXTO CHAVE:\n';
            for (const insight of integrated.keyInsights.slice(0, 3)) {
                formatted += `• ${insight}\n`;
            }
        }

        // 2. Priorities
        if (integrated.priorities.length > 0) {
            formatted += '\n🎯 PRIORIDADES:\n';
            for (const priority of integrated.priorities.slice(0, 2)) {
                const icon = priority.priority === 'critical' ? '🚨' : '⚡';
                formatted += `${icon} ${priority.message}\n`;
            }
        }

        // 3. Warnings
        if (integrated.warnings.length > 0) {
            formatted += '\n⚠️ AVISOS:\n';
            for (const warning of integrated.warnings.slice(0, 2)) {
                formatted += `• ${warning.message}\n`;
            }
        }

        // 4. Suggestions
        if (integrated.suggestions.length > 0) {
            formatted += '\n💡 SUGESTÕES:\n';
            for (const suggestion of integrated.suggestions.slice(0, 3)) {
                formatted += `• ${suggestion.message}\n`;
            }
        }

        // 5. Tone
        if (integrated.tone) {
            formatted += '\n🎭 TOM RECOMENDADO:\n';
            const toneMap = {
                'enthusiastic': '🎉 Entusiasmado - comemorar com o user',
                'supportive': '🤝 Apoio - mostrar empatia e suporte',
                'urgent_focused': '⚡ Urgente e focado - ser direto e objetivo',
                'curious': '🤔 Curioso - questionar gentilmente'
            };
            formatted += `${toneMap[integrated.tone] || integrated.tone}\n`;
        }

        formatted += '\n═══════════════════════════════════════\n';
        formatted += `Confiança: ${(reasoningResults.metadata.confidence * 100).toFixed(0)}% | `;
        formatted += `Reasoners ativos: ${reasoningResults.metadata.activeReasoners}/5\n`;
        formatted += '═══════════════════════════════════════\n';

        return formatted;
    }

    /**
     * Formata insights para validação pós-IA
     */
    formatForValidation(reasoningResults) {
        if (!reasoningResults || reasoningResults.metadata.confidence < 0.5) {
            return null;
        }

        const validation = {
            shouldWarn: false,
            shouldAdjustTone: false,
            issues: [],
            suggestions: []
        };

        const integrated = reasoningResults.integrated;

        // Se há warnings críticos, IA deve mencioná-los
        if (integrated.warnings.length > 0) {
            validation.shouldWarn = true;
            validation.issues = integrated.warnings.map(w => w.message);
        }

        // Se há tom recomendado, verificar se IA seguiu
        if (integrated.tone) {
            validation.shouldAdjustTone = true;
            validation.recommendedTone = integrated.tone;
        }

        // Se há prioridades urgentes, IA deve focar nelas
        if (integrated.priorities.length > 0) {
            validation.priorities = integrated.priorities.map(p => p.message);
        }

        return validation;
    }

    /**
     * Valida resposta da IA contra raciocínio
     */
    validateResponse(aiResponse, reasoningResults) {
        const validation = {
            isValid: true,
            warnings: [],
            score: 1.0
        };

        if (!reasoningResults || reasoningResults.metadata.confidence < 0.5) {
            return validation; // Sem raciocínio suficiente, aprovar
        }

        const integrated = reasoningResults.integrated;
        const lowerResponse = aiResponse.toLowerCase();

        // 1. Se há urgência, verificar se IA mencionou
        if (integrated.urgency === 'crítico' || integrated.urgency === 'urgente') {
            const urgencyKeywords = ['urgente', 'rápido', 'agora', 'já', 'logo', 'tempo'];
            const mentionsUrgency = urgencyKeywords.some(kw => lowerResponse.includes(kw));
            
            if (!mentionsUrgency) {
                validation.warnings.push('IA não enfatizou urgência detectada');
                validation.score -= 0.2;
            }
        }

        // 2. Se há contradição, verificar se IA questionou
        if (reasoningResults.contradiction && reasoningResults.contradiction.contradictions.length > 0) {
            const questionKeywords = ['mas', 'porém', 'ué', 'espera', 'antes', 'não tinha'];
            const questions = questionKeywords.some(kw => lowerResponse.includes(kw));
            
            if (!questions) {
                validation.warnings.push('IA não questionou contradição detectada');
                validation.score -= 0.15;
            }
        }

        // 3. Se há surpresa positiva, verificar se IA comemorou
        if (reasoningResults.expectation && 
            reasoningResults.expectation.surprises.some(s => s.polarity === 'positive')) {
            const celebrationKeywords = ['parabéns', 'brabo', 'top', 'massa', 'show', 'legal'];
            const celebrates = celebrationKeywords.some(kw => lowerResponse.includes(kw));
            
            if (!celebrates) {
                validation.warnings.push('IA não comemorou resultado positivo');
                validation.score -= 0.1;
            }
        }

        // Validação falha se score muito baixo
        if (validation.score < 0.6) {
            validation.isValid = false;
        }

        return validation;
    }
}

module.exports = ReasoningEngine;

