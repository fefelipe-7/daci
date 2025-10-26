/**
 * TemporalReasoner - Raciocínio sobre tempo
 * Detecta deadlines, calcula urgência, mapeia linha do tempo
 */

const TemporalPatterns = require('../knowledge/TemporalPatterns');
const logger = require('../Logger');

class TemporalReasoner {
    constructor() {
        this.temporalPatterns = TemporalPatterns;
        logger.debug('reasoning', 'TemporalReasoner inicializado');
    }

    /**
     * Analisa mensagem para raciocínio temporal
     */
    analyze(message, context = {}) {
        const insights = {
            type: 'temporal',
            timeReferences: [],
            deadline: null,
            urgency: null,
            timeline: [],
            duration: null,
            warnings: [],
            suggestions: [],
            confidence: 0
        };

        try {
            // 1. Detectar referências temporais
            const timeRefs = this.detectTimeReferences(message);
            if (timeRefs.length > 0) {
                insights.timeReferences = timeRefs;
                insights.confidence = Math.max(insights.confidence, 0.8);
            }

            // 2. Detectar deadline
            const deadline = this.temporalPatterns.detectDeadline(message);
            if (deadline) {
                insights.deadline = deadline;
                insights.urgency = deadline.urgency;
                insights.confidence = Math.max(insights.confidence, deadline.confidence);

                // Gerar warnings baseados em urgência
                if (deadline.urgency === 'crítico' || deadline.urgency === 'urgente') {
                    insights.warnings.push({
                        type: 'time_pressure',
                        urgency: deadline.urgency,
                        hoursRemaining: deadline.hoursRemaining,
                        message: this.generateUrgencyMessage(deadline)
                    });
                }

                // Gerar sugestões de planejamento
                if (deadline.hoursRemaining > 0) {
                    const suggestion = this.generateTimeSuggestion(deadline);
                    if (suggestion) {
                        insights.suggestions.push(suggestion);
                    }
                }
            }

            // 3. Estimar duração de atividades mencionadas
            const duration = this.estimateActivityDuration(message);
            if (duration) {
                insights.duration = duration;
                insights.confidence = Math.max(insights.confidence, 0.7);

                // Se há deadline, verificar se tempo é suficiente
                if (deadline && duration) {
                    const feasibility = this.checkFeasibility(deadline, duration);
                    if (!feasibility.isFeasible) {
                        insights.warnings.push({
                            type: 'insufficient_time',
                            message: feasibility.message
                        });
                    }
                }
            }

            // 4. Construir timeline se houver múltiplas referências
            if (timeRefs.length > 1) {
                insights.timeline = this.buildTimeline(timeRefs);
            }

            // 5. Verificar contexto histórico para padrões temporais
            if (context.history && context.history.length > 0) {
                const patterns = this.detectTemporalPatterns(context.history);
                if (patterns) {
                    insights.patterns = patterns;
                }
            }

        } catch (error) {
            logger.error('reasoning', 'Erro no TemporalReasoner:', error);
        }

        return insights;
    }

    /**
     * Detecta todas as referências temporais na mensagem
     */
    detectTimeReferences(message) {
        const references = [];

        // Parse da mensagem inteira
        const mainRef = this.temporalPatterns.parseTimeReference(message);
        if (mainRef) {
            references.push(mainRef);
        }

        // Procurar por múltiplas referências em frases separadas
        const sentences = message.split(/[.!?]+/);
        for (const sentence of sentences) {
            if (sentence.trim().length === 0) continue;
            
            const ref = this.temporalPatterns.parseTimeReference(sentence);
            if (ref && !this.isDuplicateReference(ref, references)) {
                references.push(ref);
            }
        }

        return references;
    }

    /**
     * Estima duração de atividades mencionadas
     */
    estimateActivityDuration(message) {
        const lower = message.toLowerCase();
        const activities = [];

        // Procurar por atividades conhecidas
        for (const activity of Object.keys(this.temporalPatterns.TYPICAL_DURATIONS)) {
            if (lower.includes(activity)) {
                const duration = this.temporalPatterns.estimateDuration(activity);
                if (duration) {
                    activities.push(duration);
                }
            }
        }

        if (activities.length === 0) return null;

        // Se múltiplas atividades, somar durações médias
        if (activities.length > 1) {
            const totalMin = activities.reduce((sum, a) => sum + a.min, 0);
            const totalMax = activities.reduce((sum, a) => sum + a.max, 0);
            
            return {
                activities: activities.map(a => a.activity),
                min: totalMin,
                max: totalMax,
                unit: 'hours',
                average: (totalMin + totalMax) / 2,
                isMultiple: true
            };
        }

        return activities[0];
    }

    /**
     * Verifica se há tempo suficiente
     */
    checkFeasibility(deadline, duration) {
        const timeAvailable = deadline.hoursRemaining;
        const timeNeeded = duration.average;

        const isFeasible = timeAvailable >= timeNeeded;
        const ratio = timeAvailable / timeNeeded;

        let message = '';
        if (!isFeasible) {
            message = `Tempo insuficiente! Precisa de ~${Math.round(timeNeeded)}h mas só tem ${Math.round(timeAvailable)}h`;
        } else if (ratio < 1.5) {
            message = `Tempo apertado! Tem ${Math.round(timeAvailable)}h para ~${Math.round(timeNeeded)}h de trabalho`;
        }

        return {
            isFeasible,
            ratio,
            message,
            timeAvailable,
            timeNeeded
        };
    }

    /**
     * Gera mensagem de urgência
     */
    generateUrgencyMessage(deadline) {
        const formatted = this.temporalPatterns.formatTimeRemaining(deadline.hoursRemaining);
        
        if (deadline.urgency === 'crítico') {
            return `URGENTE! Apenas ${formatted} até o prazo`;
        } else if (deadline.urgency === 'urgente') {
            return `Prazo próximo: ${formatted} restantes`;
        } else if (deadline.urgency === 'importante') {
            return `Atenção: ${formatted} até o deadline`;
        }

        return `Prazo em ${formatted}`;
    }

    /**
     * Gera sugestão de gestão de tempo
     */
    generateTimeSuggestion(deadline) {
        const hours = deadline.hoursRemaining;

        if (hours < 3) {
            return {
                type: 'immediate_action',
                message: 'Foco total agora! Elimine distrações e vá direto ao ponto',
                priority: 'critical'
            };
        } else if (hours < 24) {
            return {
                type: 'time_management',
                message: 'Faça um plano rápido: liste o essencial e comece pelo mais importante',
                priority: 'high'
            };
        } else if (hours < 72) {
            return {
                type: 'planning',
                message: 'Divida o trabalho em etapas e distribua ao longo dos próximos dias',
                priority: 'medium'
            };
        }

        return {
            type: 'advance_planning',
            message: 'Tem tempo! Comece devagar e mantenha ritmo constante',
            priority: 'low'
        };
    }

    /**
     * Constrói timeline de eventos
     */
    buildTimeline(timeReferences) {
        // Ordenar por timestamp
        const sorted = timeReferences
            .filter(ref => ref.targetDate)
            .sort((a, b) => a.targetDate - b.targetDate);

        return sorted.map(ref => ({
            expression: ref.expression,
            date: ref.targetDate,
            type: ref.type,
            relativeTime: this.getRelativeTimeLabel(ref.targetDate)
        }));
    }

    /**
     * Detecta padrões temporais no histórico
     */
    detectTemporalPatterns(history) {
        const deadlines = [];
        const now = new Date();

        for (const msg of history) {
            if (typeof msg !== 'string') continue;
            
            const deadline = this.temporalPatterns.detectDeadline(msg);
            if (deadline) {
                deadlines.push(deadline);
            }
        }

        if (deadlines.length >= 2) {
            // Usuário tem múltiplos deadlines
            const urgent = deadlines.filter(d => d.urgency === 'crítico' || d.urgency === 'urgente').length;
            
            return {
                type: 'multiple_deadlines',
                total: deadlines.length,
                urgent,
                pattern: urgent >= 2 ? 'high_pressure' : 'moderate_pressure',
                suggestion: urgent >= 2 ? 
                    'Muitos prazos urgentes! Priorize o mais importante' :
                    'Organize seus prazos para não acumular'
            };
        }

        return null;
    }

    /**
     * Verifica se referência é duplicada
     */
    isDuplicateReference(ref, existingRefs) {
        for (const existing of existingRefs) {
            if (Math.abs(ref.targetDate - existing.targetDate) < 60000) { // Menos de 1 minuto de diferença
                return true;
            }
        }
        return false;
    }

    /**
     * Obtém label relativo de tempo
     */
    getRelativeTimeLabel(date) {
        const now = new Date();
        const diff = date - now;
        const hours = diff / (1000 * 60 * 60);

        if (hours < 0) return 'passado';
        if (hours < 1) return 'agora';
        if (hours < 24) return 'hoje';
        if (hours < 48) return 'amanhã';
        if (hours < 168) return 'esta semana';
        return 'futuro';
    }

    /**
     * Formata insights para inclusão no prompt
     */
    formatForPrompt(insights) {
        if (insights.confidence < 0.5) return '';

        let formatted = '\n## RACIOCÍNIO TEMPORAL:\n';

        if (insights.deadline) {
            const d = insights.deadline;
            formatted += `- DEADLINE: ${this.temporalPatterns.formatTimeRemaining(d.hoursRemaining)} (Urgência: ${d.urgency})\n`;
        }

        if (insights.duration) {
            formatted += `- Tempo estimado: ${Math.round(insights.duration.average)}h (${insights.duration.min}-${insights.duration.max}h)\n`;
        }

        if (insights.warnings.length > 0) {
            formatted += '- AVISOS:\n';
            for (const warn of insights.warnings) {
                formatted += `  ⚠️ ${warn.message}\n`;
            }
        }

        if (insights.suggestions.length > 0) {
            formatted += '- Sugestões:\n';
            for (const sug of insights.suggestions) {
                formatted += `  💡 ${sug.message}\n`;
            }
        }

        if (insights.timeline.length > 1) {
            formatted += '- Timeline:\n';
            for (const event of insights.timeline) {
                formatted += `  • ${event.relativeTime}: ${event.expression}\n`;
            }
        }

        return formatted;
    }
}

module.exports = TemporalReasoner;

