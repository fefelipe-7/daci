/**
 * IntentDetector - Detecta intenção do usuário (greeting, farewell, question, etc)
 * Usado para ajustar comportamento do bot e gerenciar contexto
 */

class IntentDetector {
    /**
     * Detecta a intenção principal da mensagem
     * @param {string} message - Mensagem do usuário
     * @param {Array} history - Histórico de mensagens
     * @returns {Object} { intent: string, confidence: number, metadata: {} }
     */
    static detect(message, history = []) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Testar cada intent em ordem de prioridade
        const intents = [
            this.detectCommand(lowerMessage),
            this.detectFarewell(lowerMessage, history),
            this.detectGreeting(lowerMessage),
            this.detectQuestion(lowerMessage),
            this.detectTopicChange(lowerMessage, history),
            this.detectContinuation(lowerMessage, history),
            this.detectStatement(lowerMessage)
        ];
        
        // Retornar intent com maior confiança
        return intents.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
        );
    }
    
    /**
     * Detecta comandos (ex: /comando, !comando)
     */
    static detectCommand(message) {
        const commandPattern = /^[/!](\w+)/;
        const match = message.match(commandPattern);
        
        if (match) {
            return {
                intent: 'command',
                confidence: 1.0,
                metadata: { command: match[1] }
            };
        }
        
        return { intent: 'command', confidence: 0.0, metadata: {} };
    }
    
    /**
     * Detecta despedidas (farewell)
     */
    static detectFarewell(message, history) {
        const farewellPatterns = [
            /^(tchau|flw|falou|até|adeus|xau|bye|até logo|até mais|abraço|valeu)\b/,
            /^(blz|ok|beleza|ta bom|tá bom|suave)$/,
            /^(tenho que ir|preciso ir|vou nessa|vo nessa|fui)\b/
        ];
        
        const hasFarewell = farewellPatterns.some(pattern => pattern.test(message));
        
        if (!hasFarewell) {
            return { intent: 'farewell', confidence: 0.0, metadata: {} };
        }
        
        // Aumentar confiança se é uma mensagem curta após conversa longa
        let confidence = 0.8;
        if (history.length > 3 && message.split(' ').length <= 3) {
            confidence = 0.95;
        }
        
        return {
            intent: 'farewell',
            confidence,
            metadata: { shouldClearContext: true }
        };
    }
    
    /**
     * Detecta saudações (greeting)
     */
    static detectGreeting(message) {
        const greetingPatterns = [
            /^(oi|olá|ola|oie|oii|eae|eai|e aí|e ai|fala|salve|bom dia|boa tarde|boa noite)\b/,
            /^(hey|hi|hello|yo)\b/
        ];
        
        const hasGreeting = greetingPatterns.some(pattern => pattern.test(message));
        
        if (!hasGreeting) {
            return { intent: 'greeting', confidence: 0.0, metadata: {} };
        }
        
        // Maior confiança se é mensagem curta (1-3 palavras)
        const wordCount = message.split(' ').length;
        const confidence = wordCount <= 3 ? 0.95 : 0.7;
        
        return {
            intent: 'greeting',
            confidence,
            metadata: { casual: message.includes('eae') || message.includes('fala') }
        };
    }
    
    /**
     * Detecta perguntas (question)
     */
    static detectQuestion(message) {
        // Termina com ?
        if (message.endsWith('?')) {
            return {
                intent: 'question',
                confidence: 0.95,
                metadata: { explicit: true }
            };
        }
        
        // Começa com palavra interrogativa
        const questionWords = [
            /^(o que|oq|oque|que)\b/,
            /^(como|cmo)\b/,
            /^(quando|qnd|quanto)\b/,
            /^(onde|ond|aonde)\b/,
            /^(quem|qual|quais)\b/,
            /^(por que|pq|porque|porq)\b/,
            /^(pode|poderia|consegue)\b/,
            /^(sabe|saberia|conhece)\b/,
            /^(tem|teria|existe)\b/
        ];
        
        const hasQuestionWord = questionWords.some(pattern => pattern.test(message));
        
        if (hasQuestionWord) {
            return {
                intent: 'question',
                confidence: 0.85,
                metadata: { explicit: false }
            };
        }
        
        return { intent: 'question', confidence: 0.0, metadata: {} };
    }
    
    /**
     * Detecta mudança de tópico (topic_change)
     */
    static detectTopicChange(message, history) {
        if (history.length === 0) {
            return { intent: 'topic_change', confidence: 0.0, metadata: {} };
        }
        
        const topicChangePatterns = [
            /^(mudando de assunto|voltando|agora|enfim|bom|então|aliás|mas|porém)\b/,
            /^(deixa pra lá|esquece|tanto faz)\b/,
            /^(outra coisa|falando nisso)\b/
        ];
        
        const hasTopicChange = topicChangePatterns.some(pattern => pattern.test(message));
        
        if (hasTopicChange) {
            return {
                intent: 'topic_change',
                confidence: 0.9,
                metadata: { explicit: true }
            };
        }
        
        // Detecção implícita: mensagem muito diferente das anteriores
        const lastMessages = history.slice(-3);
        if (lastMessages.length >= 2) {
            const lastTopics = this.extractSimpleTopics(lastMessages.map(m => m.content).join(' '));
            const currentTopics = this.extractSimpleTopics(message);
            
            const overlap = currentTopics.filter(t => lastTopics.includes(t)).length;
            
            if (overlap === 0 && currentTopics.length > 0 && lastTopics.length > 0) {
                return {
                    intent: 'topic_change',
                    confidence: 0.6,
                    metadata: { explicit: false }
                };
            }
        }
        
        return { intent: 'topic_change', confidence: 0.0, metadata: {} };
    }
    
    /**
     * Detecta continuação de tópico (continuation)
     */
    static detectContinuation(message, history) {
        if (history.length === 0) {
            return { intent: 'continuation', confidence: 0.0, metadata: {} };
        }
        
        const continuationPatterns = [
            /^(e então|e aí|e|continuando|voltando)\b/,
            /^(sobre isso|sobre|nisso|disso|daquilo)\b/,
            /^(tipo|assim|também|ainda)\b/
        ];
        
        const hasContinuation = continuationPatterns.some(pattern => pattern.test(message));
        
        if (hasContinuation) {
            return {
                intent: 'continuation',
                confidence: 0.85,
                metadata: { explicit: true }
            };
        }
        
        // Detecção implícita: referências pronominais ou tópico similar
        const pronouns = ['ele', 'ela', 'isso', 'aquilo', 'esse', 'essa', 'disso'];
        const hasPronoun = pronouns.some(p => message.includes(p));
        
        if (hasPronoun) {
            return {
                intent: 'continuation',
                confidence: 0.7,
                metadata: { explicit: false }
            };
        }
        
        // Verificar overlap de tópicos com histórico
        const lastMessages = history.slice(-3);
        if (lastMessages.length > 0) {
            const lastTopics = this.extractSimpleTopics(lastMessages.map(m => m.content).join(' '));
            const currentTopics = this.extractSimpleTopics(message);
            
            const overlap = currentTopics.filter(t => lastTopics.includes(t)).length;
            
            if (overlap > 0) {
                return {
                    intent: 'continuation',
                    confidence: 0.65,
                    metadata: { topicOverlap: overlap }
                };
            }
        }
        
        return { intent: 'continuation', confidence: 0.0, metadata: {} };
    }
    
    /**
     * Detecta afirmação simples (statement)
     */
    static detectStatement(message) {
        // Fallback: se nenhum intent específico foi detectado, é um statement
        return {
            intent: 'statement',
            confidence: 0.5,
            metadata: {}
        };
    }
    
    /**
     * Extrai tópicos simples de uma mensagem (para comparação)
     */
    static extractSimpleTopics(text) {
        const keywords = ['jogo', 'filme', 'música', 'anime', 'comida', 'trabalho', 'estudo', 'festa', 'meme'];
        const topics = [];
        const lowerText = text.toLowerCase();
        
        keywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                topics.push(keyword);
            }
        });
        
        return topics;
    }
    
    /**
     * Verifica se deve limpar contexto baseado no intent
     * @param {Object} intentResult - Resultado do detect()
     * @returns {boolean} Se deve limpar contexto
     */
    static shouldClearContext(intentResult) {
        if (intentResult.intent === 'farewell' && intentResult.confidence > 0.8) {
            return true;
        }
        
        if (intentResult.intent === 'topic_change' && intentResult.confidence > 0.85) {
            return true;
        }
        
        return false;
    }
}

module.exports = IntentDetector;

