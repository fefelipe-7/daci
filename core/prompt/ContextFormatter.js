/**
 * ContextFormatter - Formatador de contexto do usuário
 * 
 * Formata todo o contexto da mensagem atual incluindo:
 * - Histórico
 * - Sentimento
 * - Memórias ativas
 * - Contexto temporal
 * - Entidades e pronomes
 */

class ContextFormatter {
    constructor(historyCompressor) {
        this.historyCompressor = historyCompressor;
    }

    /**
     * Constrói contexto da mensagem atual do usuário
     */
    buildUserContext(message, context = {}) {
        let userPrompt = '';

        // Adicionar histórico de conversa PRIMEIRO
        if (context.history && context.history.length > 0) {
            const compressedHistory = this.historyCompressor.compressHistory(context.history);
            userPrompt += compressedHistory;
        }

        // Adicionar análise de sentimento
        if (context.sentiment) {
            const { classification, intensity, emotions } = context.sentiment;
            userPrompt += `\nSentimento detectado: ${classification} (intensidade: ${intensity.toFixed(2)})`;
            if (emotions && emotions.length > 0 && !emotions.includes('neutral')) {
                userPrompt += `\nEmoções: ${emotions.join(', ')}`;
            }
        }

        // Adicionar memórias ativas
        if (context.activeMemory) {
            const { knownPreferences, recentTopics, messageCount } = context.activeMemory;
            
            if (recentTopics && recentTopics.length > 0) {
                userPrompt += `\n\nTópicos recentes de conversa: ${recentTopics.join(', ')}`;
            }
            
            if (knownPreferences && knownPreferences.length > 0) {
                userPrompt += `\n\nPreferências conhecidas sobre o usuário:`;
                knownPreferences.forEach(pref => {
                    const content = pref.content.substring(0, 80);
                    userPrompt += `\n- ${content}`;
                });
            }
            
            if (messageCount > 5) {
                userPrompt += `\n\nEsta conversa já tem ${messageCount} mensagens trocadas. Mantenha a continuidade natural.`;
            }
        }

        // Adicionar contexto temporal
        if (context.temporal) {
            const { period, mood, isWeekend } = context.temporal;
            const periodMsg = {
                'morning': 'manhã',
                'afternoon': 'tarde',
                'evening': 'noite',
                'night': 'madrugada'
            }[period] || period;
            
            userPrompt += `\n\nContexto: ${periodMsg}`;
            if (isWeekend) userPrompt += ' (fim de semana)';
        }

        // Adicionar tipo de canal
        if (context.channel) {
            if (context.channel.isDM) {
                userPrompt += `\nCanal: DM (conversa privada)`;
            } else if (context.channel.name) {
                userPrompt += `\nCanal: ${context.channel.name}`;
            }
        }

        // Adicionar menções
        if (context.mentions && context.mentions.length > 0) {
            const userMentions = context.mentions.filter(m => m.type === 'user');
            if (userMentions.length > 0) {
                userPrompt += `\n\nOutras pessoas mencionadas: ${userMentions.map(m => m.username).join(', ')}`;
                userPrompt += `\n(Considere essas menções na sua resposta se relevante)`;
            }
        }
        
        // Adicionar entidades detectadas
        if (context.entities && this.hasSignificantEntities(context.entities)) {
            userPrompt += `\n\n=== ENTIDADES DETECTADAS NA CONVERSA ===\n`;
            if (context.entities.pessoas && context.entities.pessoas.length > 0) {
                userPrompt += `Pessoas: ${context.entities.pessoas.join(', ')}\n`;
            }
            if (context.entities.eventos && context.entities.eventos.length > 0) {
                const eventos = context.entities.eventos.map(e => e.tipo || e).join(', ');
                userPrompt += `Eventos: ${eventos}\n`;
            }
            if (context.entities.lugares && context.entities.lugares.length > 0) {
                userPrompt += `Lugares: ${context.entities.lugares.join(', ')}\n`;
            }
            if (context.entities.objetos && context.entities.objetos.length > 0) {
                userPrompt += `Objetos/Coisas: ${context.entities.objetos.join(', ')}\n`;
            }
        }
        
        // Adicionar pronomes resolvidos
        if (context.pronounResolution && context.pronounResolution.resolutions && context.pronounResolution.resolutions.length > 0) {
            userPrompt += `\n=== PRONOMES RESOLVIDOS ===\n`;
            context.pronounResolution.resolutions.forEach(r => {
                if (r.entity && r.confidence > 0.5) {
                    userPrompt += `- "${r.pronoun}" refere-se a: ${r.entity}\n`;
                }
            });
        }
        
        // NOVO: Adicionar insights de raciocínio lógico
        if (context.reasoning && context.reasoning.metadata.confidence > 0.5) {
            const ReasoningEngine = require('../reasoning/ReasoningEngine');
            const engine = new ReasoningEngine();
            const reasoningPrompt = engine.formatForPrompt(context.reasoning);
            
            if (reasoningPrompt) {
                userPrompt += reasoningPrompt;
            }
        }

        // MENSAGEM ATUAL DO USUÁRIO
        userPrompt += `\n\n=== MENSAGEM ATUAL DO USUÁRIO ===\n"${message}"\n`;

        // INSTRUÇÕES DE RESPOSTA
        userPrompt += `\n=== INSTRUÇÕES DE RESPOSTA ===

1. CONTEXTO: Você está em uma conversa contínua. Refira-se ao que foi dito antes naturalmente.

2. CONTINUIDADE: Se o usuário mencionar algo já discutido, demonstre que você lembra e conecte com a conversa anterior.

3. PERGUNTAS: Se o usuário fizer uma pergunta sobre algo já mencionado, use esse contexto para responder de forma completa.

4. TOM: Mantenha sua personalidade (Daci) - informal, mandrake, brasileiro. Não seja genérico ou robótico.

5. FORMATO: Responda de forma direta mas natural. NÃO faça perguntas no final a menos que seja essencial para entender algo.

Responda agora como Daci, de forma natural e contextual:`;

        return userPrompt;
    }

    /**
     * Detecta tipo de mensagem
     */
    detectMessageType(message) {
        const msg = message.toLowerCase();

        if (msg.match(/\b(oi|olá|hey|e aí|fala)\b/)) return 'greeting';
        if (msg.match(/\b(tchau|flw|até|valeu)\b/)) return 'farewell';
        if (msg.includes('?')) return 'question';
        if (msg.match(/\b(obrigad|valeu|tmj)\b/)) return 'thanks';
        if (msg.match(/\b(kkkk|rsrs|haha|lol)\b/)) return 'laughing';

        return 'statement';
    }

    /**
     * Verifica se há entidades significativas
     */
    hasSignificantEntities(entities) {
        if (!entities) return false;
        
        return (entities.pessoas && entities.pessoas.length > 0) ||
               (entities.eventos && entities.eventos.length > 0) ||
               (entities.lugares && entities.lugares.length > 0) ||
               (entities.objetos && entities.objetos.length > 0);
    }
}

module.exports = ContextFormatter;

