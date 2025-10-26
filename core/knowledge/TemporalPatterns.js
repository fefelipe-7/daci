/**
 * TemporalPatterns - Padrões temporais e referências de tempo
 * Para raciocínio temporal humano
 */

class TemporalPatterns {
    /**
     * Mapeamento de expressões temporais relativas
     */
    static RELATIVE_TIME = {
        // Passado
        'ontem': { days: -1, type: 'past' },
        'anteontem': { days: -2, type: 'past' },
        'semana passada': { days: -7, type: 'past' },
        'mês passado': { days: -30, type: 'past' },
        'ano passado': { days: -365, type: 'past' },
        'há pouco': { hours: -1, type: 'past' },
        'há um tempo': { days: -7, type: 'past' },
        'antes': { days: -1, type: 'past' },
        
        // Futuro
        'amanhã': { days: 1, type: 'future' },
        'depois de amanhã': { days: 2, type: 'future' },
        'semana que vem': { days: 7, type: 'future' },
        'próxima semana': { days: 7, type: 'future' },
        'mês que vem': { days: 30, type: 'future' },
        'próximo mês': { days: 30, type: 'future' },
        'ano que vem': { days: 365, type: 'future' },
        'daqui a pouco': { hours: 1, type: 'future' },
        'depois': { days: 1, type: 'future' },
        'em breve': { days: 3, type: 'future' },
        
        // Presente
        'agora': { hours: 0, type: 'present' },
        'hoje': { days: 0, type: 'present' },
        'neste momento': { hours: 0, type: 'present' },
        'atualmente': { days: 0, type: 'present' }
    };

    /**
     * Níveis de urgência baseados em tempo restante
     */
    static URGENCY_LEVELS = {
        critico: { maxHours: 3, label: 'crítico', multiplier: 5 },
        urgente: { maxHours: 24, label: 'urgente', multiplier: 3 },
        importante: { maxHours: 72, label: 'importante', multiplier: 2 },
        moderado: { maxHours: 168, label: 'moderado', multiplier: 1 },
        tranquilo: { maxHours: Infinity, label: 'tranquilo', multiplier: 0.5 }
    };

    /**
     * Durações típicas de atividades
     */
    static TYPICAL_DURATIONS = {
        'estudar': { min: 1, max: 8, unit: 'hours' },
        'trabalhar': { min: 4, max: 10, unit: 'hours' },
        'dormir': { min: 6, max: 10, unit: 'hours' },
        'comer': { min: 0.25, max: 1, unit: 'hours' },
        'exercício': { min: 0.5, max: 2, unit: 'hours' },
        'prova': { min: 1, max: 4, unit: 'hours' },
        'reunião': { min: 0.5, max: 2, unit: 'hours' },
        'viagem': { min: 2, max: 48, unit: 'hours' }
    };

    /**
     * Palavras-chave temporais
     */
    static TEMPORAL_KEYWORDS = {
        deadline: ['prazo', 'deadline', 'entregar', 'vencimento', 'data limite'],
        duration: ['durante', 'por', 'tempo de', 'duração', 'demora'],
        sequence: ['antes', 'depois', 'então', 'em seguida', 'primeiro', 'segundo', 'finalmente'],
        frequency: ['sempre', 'nunca', 'às vezes', 'frequentemente', 'raramente', 'todo dia', 'toda semana']
    };

    /**
     * Parse de referência temporal relativa
     */
    static parseTimeReference(text) {
        const lower = text.toLowerCase();
        
        // Tentar match com expressões conhecidas
        for (const [expression, offset] of Object.entries(this.RELATIVE_TIME)) {
            if (lower.includes(expression)) {
                const targetDate = new Date();
                
                if (offset.days !== undefined) {
                    targetDate.setDate(targetDate.getDate() + offset.days);
                } else if (offset.hours !== undefined) {
                    targetDate.setHours(targetDate.getHours() + offset.hours);
                }
                
                return {
                    expression,
                    targetDate,
                    type: offset.type,
                    offset,
                    confidence: 0.9
                };
            }
        }

        // Tentar extrair números (ex: "daqui a 3 dias")
        const numericPattern = /(?:daqui a|em|dentro de)\s+(\d+)\s+(hora|horas|dia|dias|semana|semanas|mês|meses)/i;
        const match = lower.match(numericPattern);
        
        if (match) {
            const amount = parseInt(match[1]);
            const unit = match[2];
            const targetDate = new Date();
            
            if (unit.startsWith('hora')) {
                targetDate.setHours(targetDate.getHours() + amount);
            } else if (unit.startsWith('dia')) {
                targetDate.setDate(targetDate.getDate() + amount);
            } else if (unit.startsWith('semana')) {
                targetDate.setDate(targetDate.getDate() + (amount * 7));
            } else if (unit.startsWith('mês') || unit.startsWith('mes')) {
                targetDate.setMonth(targetDate.getMonth() + amount);
            }
            
            return {
                expression: match[0],
                targetDate,
                type: 'future',
                offset: { amount, unit },
                confidence: 0.85
            };
        }

        return null;
    }

    /**
     * Calcula urgência baseada em tempo até deadline
     */
    static calculateUrgency(deadlineDate, now = new Date()) {
        const hoursRemaining = (deadlineDate - now) / (1000 * 60 * 60);
        
        if (hoursRemaining < 0) {
            return {
                level: 'atrasado',
                hoursRemaining: Math.abs(hoursRemaining),
                multiplier: 10,
                isPast: true
            };
        }

        for (const [level, config] of Object.entries(this.URGENCY_LEVELS)) {
            if (hoursRemaining <= config.maxHours) {
                return {
                    level: config.label,
                    hoursRemaining,
                    multiplier: config.multiplier,
                    isPast: false
                };
            }
        }

        return {
            level: 'tranquilo',
            hoursRemaining,
            multiplier: 0.5,
            isPast: false
        };
    }

    /**
     * Detecta deadline na mensagem
     */
    static detectDeadline(message) {
        const lower = message.toLowerCase();
        
        // Procurar por palavras-chave de deadline
        const hasDeadlineKeyword = this.TEMPORAL_KEYWORDS.deadline.some(kw => lower.includes(kw));
        
        if (!hasDeadlineKeyword) {
            return null;
        }

        // Tentar extrair referência temporal
        const timeRef = this.parseTimeReference(message);
        
        if (timeRef) {
            const urgency = this.calculateUrgency(timeRef.targetDate);
            
            return {
                deadline: timeRef.targetDate,
                urgency: urgency.level,
                hoursRemaining: urgency.hoursRemaining,
                confidence: timeRef.confidence
            };
        }

        return null;
    }

    /**
     * Extrai sequência temporal de eventos
     */
    static extractSequence(messages) {
        const events = [];
        
        for (const msg of messages) {
            const timeRef = this.parseTimeReference(msg);
            if (timeRef) {
                events.push({
                    message: msg,
                    timestamp: timeRef.targetDate,
                    type: timeRef.type
                });
            }
        }

        // Ordenar por timestamp
        events.sort((a, b) => a.timestamp - b.timestamp);
        
        return events;
    }

    /**
     * Estima duração de uma atividade
     */
    static estimateDuration(activity) {
        const lower = activity.toLowerCase();
        
        for (const [key, duration] of Object.entries(this.TYPICAL_DURATIONS)) {
            if (lower.includes(key)) {
                return {
                    activity: key,
                    min: duration.min,
                    max: duration.max,
                    unit: duration.unit,
                    average: (duration.min + duration.max) / 2
                };
            }
        }

        return null;
    }

    /**
     * Formata tempo restante de forma humanizada
     */
    static formatTimeRemaining(hours) {
        if (hours < 1) {
            return `${Math.round(hours * 60)} minutos`;
        } else if (hours < 24) {
            return `${Math.round(hours)} horas`;
        } else {
            const days = Math.round(hours / 24);
            return `${days} dia${days > 1 ? 's' : ''}`;
        }
    }
}

module.exports = TemporalPatterns;

