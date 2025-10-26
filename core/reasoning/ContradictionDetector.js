/**
 * ContradictionDetector - Detecta contradições e inconsistências
 * Compara statements atuais com histórico para manter coerência
 */

const CommonSense = require('../knowledge/CommonSense');
const logger = require('../Logger');

class ContradictionDetector {
    constructor() {
        this.commonSense = CommonSense;
        logger.debug('reasoning', 'ContradictionDetector inicializado');
    }

    /**
     * Analisa mensagem para contradições
     */
    analyze(message, context = {}) {
        const insights = {
            type: 'contradiction',
            contradictions: [],
            inconsistencies: [],
            opposites: [],
            warnings: [],
            confidence: 0
        };

        try {
            // 1. Extrair statements da mensagem atual
            const currentStatements = this.extractStatements(message);

            // 2. Comparar com histórico recente
            if (context.history && context.history.length > 0) {
                const contradictions = this.findContradictions(
                    currentStatements,
                    context.history
                );

                if (contradictions.length > 0) {
                    insights.contradictions = contradictions;
                    insights.confidence = 0.8;

                    // Gerar warnings
                    for (const contra of contradictions) {
                        insights.warnings.push({
                            type: 'contradiction',
                            current: contra.current,
                            previous: contra.previous,
                            message: this.formatContradictionMessage(contra)
                        });
                    }
                }
            }

            // 3. Verificar opostos dentro da própria mensagem
            const opposites = this.findOppositesInMessage(message);
            if (opposites.length > 0) {
                insights.opposites = opposites;
                insights.confidence = Math.max(insights.confidence, 0.7);
            }

            // 4. Detectar ações incompatíveis
            if (context.activeMemory) {
                const incompatibilities = this.detectIncompatibilities(
                    message,
                    context.activeMemory
                );

                if (incompatibilities.length > 0) {
                    insights.inconsistencies = incompatibilities;
                    insights.confidence = Math.max(insights.confidence, 0.6);
                }
            }

        } catch (error) {
            logger.error('reasoning', 'Erro no ContradictionDetector:', error);
        }

        return insights;
    }

    /**
     * Extrai statements (afirmações) da mensagem
     */
    extractStatements(message) {
        const statements = [];
        
        // Split por pontuação
        const sentences = message.split(/[.!?;]+/).map(s => s.trim()).filter(s => s.length > 0);

        for (const sentence of sentences) {
            const lower = sentence.toLowerCase();

            // Detectar negações
            const isNegative = this.containsNegation(lower);

            // Detectar sentimento/opinião (amo, odeio, gosto, etc)
            const sentiment = this.extractSentiment(lower);

            // Detectar intenções (vou, quero, vou fazer, etc)
            const intention = this.extractIntention(lower);

            if (sentiment || intention) {
                statements.push({
                    text: sentence,
                    isNegative,
                    sentiment,
                    intention,
                    timestamp: Date.now()
                });
            }
        }

        return statements;
    }

    /**
     * Procura contradições com o histórico
     */
    findContradictions(currentStatements, history) {
        const contradictions = [];
        
        // Processar últimas 20 mensagens do histórico
        const recentHistory = history.slice(-20);
        const historicalStatements = [];

        for (const msg of recentHistory) {
            if (typeof msg !== 'string') continue;
            
            const statements = this.extractStatements(msg);
            historicalStatements.push(...statements);
        }

        // Comparar cada statement atual com histórico
        for (const current of currentStatements) {
            for (const past of historicalStatements) {
                const contradiction = this.compareStatements(current, past);
                
                if (contradiction) {
                    contradictions.push({
                        current: current.text,
                        previous: past.text,
                        type: contradiction.type,
                        confidence: contradiction.confidence,
                        timeDiff: Date.now() - past.timestamp
                    });
                }
            }
        }

        return contradictions;
    }

    /**
     * Compara dois statements para detectar contradição
     */
    compareStatements(stmt1, stmt2) {
        // 1. Sentimentos opostos sobre mesmo assunto
        if (stmt1.sentiment && stmt2.sentiment) {
            const subject1 = this.extractSubject(stmt1.text);
            const subject2 = this.extractSubject(stmt2.text);

            if (subject1 && subject2 && this.isSimilarSubject(subject1, subject2)) {
                // Verificar se sentimentos são opostos
                if (this.commonSense.areOpposite(stmt1.sentiment, stmt2.sentiment)) {
                    return {
                        type: 'opposite_sentiment',
                        confidence: 0.9
                    };
                }

                // Verificar negação vs afirmação
                if (stmt1.isNegative !== stmt2.isNegative) {
                    return {
                        type: 'negation_conflict',
                        confidence: 0.8
                    };
                }
            }
        }

        // 2. Intenções conflitantes
        if (stmt1.intention && stmt2.intention) {
            if (this.commonSense.areIncompatible(stmt1.intention, stmt2.intention)) {
                return {
                    type: 'incompatible_intentions',
                    confidence: 0.85
                };
            }
        }

        // 3. Mesma intenção repetida (pode ser procrastinação)
        if (stmt1.intention && stmt2.intention) {
            if (this.isSimilarIntention(stmt1.intention, stmt2.intention)) {
                const timeDiff = (stmt1.timestamp - stmt2.timestamp) / (1000 * 60 * 60 * 24); // dias
                
                if (timeDiff > 2) { // Mais de 2 dias
                    return {
                        type: 'repeated_intention',
                        confidence: 0.7
                    };
                }
            }
        }

        return null;
    }

    /**
     * Encontra opostos dentro da mesma mensagem
     */
    findOppositesInMessage(message) {
        const opposites = [];
        const words = message.toLowerCase().split(/\s+/);
        
        // Testar cada par de palavras
        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j < words.length; j++) {
                if (this.commonSense.areOpposite(words[i], words[j])) {
                    opposites.push({
                        word1: words[i],
                        word2: words[j],
                        confidence: 0.8
                    });
                }
            }
        }

        return opposites;
    }

    /**
     * Detecta incompatibilidades com contexto ativo
     */
    detectIncompatibilities(message, activeMemory) {
        const incompatibilities = [];
        const currentActions = this.extractActions(message);

        if (activeMemory.activeTopic) {
            for (const action of currentActions) {
                if (this.commonSense.areIncompatible(action, activeMemory.activeTopic)) {
                    incompatibilities.push({
                        action,
                        conflictsWith: activeMemory.activeTopic,
                        confidence: 0.7
                    });
                }
            }
        }

        return incompatibilities;
    }

    /**
     * Verifica se texto contém negação
     */
    containsNegation(text) {
        const negations = ['não', 'nunca', 'jamais', 'nada', 'nenhum', 'nem'];
        return negations.some(neg => text.includes(neg));
    }

    /**
     * Extrai sentimento/opinião da frase
     */
    extractSentiment(text) {
        const sentiments = {
            'amo': 'amar',
            'adoro': 'amar',
            'gosto': 'gostar',
            'odeio': 'odiar',
            'detesto': 'odiar',
            'não gosto': 'não gostar',
            'prefiro': 'preferir',
            'quero': 'querer'
        };

        for (const [keyword, sentiment] of Object.entries(sentiments)) {
            if (text.includes(keyword)) {
                return sentiment;
            }
        }

        return null;
    }

    /**
     * Extrai intenção da frase
     */
    extractIntention(text) {
        const intentions = [
            'vou', 'irei', 'pretendo', 'quero', 'vou fazer',
            'vou começar', 'vou parar', 'vou deixar'
        ];

        for (const keyword of intentions) {
            if (text.includes(keyword)) {
                // Extrair o que vem depois da intenção
                const parts = text.split(keyword);
                if (parts.length > 1) {
                    return parts[1].trim().split(/\s+/).slice(0, 5).join(' '); // Primeiras 5 palavras
                }
            }
        }

        return null;
    }

    /**
     * Extrai sujeito da frase
     */
    extractSubject(text) {
        // Simplificado: pegar substantivos após sentimento
        const words = text.toLowerCase().split(/\s+/);
        const sentimentIndex = words.findIndex(w => 
            ['amo', 'odeio', 'gosto', 'adoro', 'detesto'].includes(w)
        );

        if (sentimentIndex >= 0 && sentimentIndex < words.length - 1) {
            // Pular palavras de ligação
            let i = sentimentIndex + 1;
            while (i < words.length && ['de', 'do', 'da', 'o', 'a'].includes(words[i])) {
                i++;
            }
            if (i < words.length) {
                return words[i];
            }
        }

        return null;
    }

    /**
     * Verifica se sujeitos são similares
     */
    isSimilarSubject(subj1, subj2) {
        if (!subj1 || !subj2) return false;
        
        // Exato
        if (subj1 === subj2) return true;

        // Um contém o outro
        if (subj1.includes(subj2) || subj2.includes(subj1)) return true;

        // Plural/singular
        if (subj1.endsWith('s') && subj1.slice(0, -1) === subj2) return true;
        if (subj2.endsWith('s') && subj2.slice(0, -1) === subj1) return true;

        return false;
    }

    /**
     * Verifica se intenções são similares
     */
    isSimilarIntention(int1, int2) {
        if (!int1 || !int2) return false;

        // Normalizar
        const norm1 = int1.toLowerCase().trim();
        const norm2 = int2.toLowerCase().trim();

        // Similarity simples
        const words1 = norm1.split(/\s+/);
        const words2 = norm2.split(/\s+/);

        const commonWords = words1.filter(w => words2.includes(w)).length;
        const similarity = (2 * commonWords) / (words1.length + words2.length);

        return similarity > 0.5;
    }

    /**
     * Extrai ações da mensagem
     */
    extractActions(message) {
        const actions = [];
        const words = message.toLowerCase().split(/\s+/);
        
        const actionKeywords = ['dormir', 'trabalhar', 'estudar', 'comer', 'sair', 'ficar'];
        
        for (const word of words) {
            if (actionKeywords.includes(word)) {
                actions.push(word);
            }
        }

        return actions;
    }

    /**
     * Formata mensagem de contradição
     */
    formatContradictionMessage(contradiction) {
        switch (contradiction.type) {
        case 'opposite_sentiment':
            return `Contradição detectada: antes disse "${contradiction.previous}", agora "${contradiction.current}"`;
        case 'repeated_intention':
            return `Você já tinha dito isso antes: "${contradiction.previous}"`;
        case 'incompatible_intentions':
            return `Intenções conflitantes: "${contradiction.current}" vs "${contradiction.previous}"`;
        default:
            return `Inconsistência detectada entre mensagens`;
        }
    }

    /**
     * Formata insights para inclusão no prompt
     */
    formatForPrompt(insights) {
        if (insights.confidence < 0.6) return '';

        let formatted = '\n## DETECÇÃO DE CONTRADIÇÕES:\n';

        if (insights.contradictions.length > 0) {
            formatted += '- CONTRADIÇÕES DETECTADAS:\n';
            for (const contra of insights.contradictions.slice(0, 2)) {
                formatted += `  ⚠️ ${this.formatContradictionMessage(contra)}\n`;
            }
        }

        if (insights.opposites.length > 0) {
            formatted += '- Opostos na mesma frase:\n';
            for (const opp of insights.opposites) {
                formatted += `  • "${opp.word1}" vs "${opp.word2}"\n`;
            }
        }

        if (insights.inconsistencies.length > 0) {
            formatted += '- Ações incompatíveis:\n';
            for (const inc of insights.inconsistencies) {
                formatted += `  • "${inc.action}" conflita com "${inc.conflictsWith}"\n`;
            }
        }

        return formatted;
    }
}

module.exports = ContradictionDetector;

