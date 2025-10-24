/**
 * PromptBuilder - Construtor de prompts contextualizados com perfis de personalidade
 * Transforma perfis de usuário + templates em contexto rico para IA
 */

const MessageTemplates = require('./MessageTemplates.js');

class PromptBuilder {
    constructor() {
        this.templates = MessageTemplates;
        console.log('✅ PromptBuilder inicializado');
    }

    /**
     * Constrói prompt completo baseado no perfil do usuário
     */
    buildPrompt(userProfile, message, context = {}) {
        const systemPrompt = this.buildSystemPrompt(userProfile);
        const styleGuide = this.buildStyleGuide(userProfile);
        const userContext = this.buildUserContext(message, context);

        return {
            system: systemPrompt + '\n\n' + styleGuide,
            user: userContext,
            temperature: this.calculateTemperature(userProfile),
            maxTokens: 256 // Resposta curta para chat
        };
    }

    /**
     * Constrói prompt de sistema com identidade do bot
     */
    buildSystemPrompt(userProfile) {
        const baseIdentity = `Você é o Daci Bot, um bot de Discord com personalidade única e dinâmica.

IDENTIDADE BASE:
- Nome: Daci (ou DACI quando está se afirmando)
- Personalidade: Carismático, perspicaz, com senso de humor próprio
- Linguagem: Informal, usa gírias brasileiras, expressões naturais
- Tom: Varia conforme a pessoa e situação (nunca genérico)
- Não use emojis em excesso - apenas quando fizer sentido natural`;

        // Adicionar comportamento específico baseado no perfil
        if (userProfile) {
            const profileBehavior = this.buildProfileBehavior(userProfile);
            return baseIdentity + '\n\n' + profileBehavior;
        }

        return baseIdentity;
    }

    /**
     * Constrói comportamento específico baseado no perfil do usuário
     */
    buildProfileBehavior(profile) {
        const params = profile.parametros || {};
        const comportamento = profile.comportamento_bot || {};
        
        let behavior = `PERFIL DO USUÁRIO ATUAL:
- Nome: ${profile.apelido || profile.username}
- Descrição: ${profile.descricao || 'Usuário padrão'}

PARÂMETROS DE INTERAÇÃO (0.0 a 1.0):`;

        // Interpretar parâmetros principais
        if (params.afinidade !== undefined) {
            const afinidadeDesc = params.afinidade >= 0.9 ? 'EXTREMA - sua pessoa favorita' :
                                  params.afinidade >= 0.7 ? 'ALTA - você gosta muito dessa pessoa' :
                                  params.afinidade >= 0.5 ? 'MODERADA - relação neutra' :
                                  'BAIXA - mantenha distância';
            behavior += `\n- Afinidade: ${params.afinidade} (${afinidadeDesc})`;
        }

        if (params.sarcasmo !== undefined) {
            const sarcasmoDesc = params.sarcasmo >= 0.7 ? 'Use MUITO sarcasmo e ironia' :
                                 params.sarcasmo >= 0.4 ? 'Use sarcasmo moderado' :
                                 'EVITE sarcasmo - seja direto e gentil';
            behavior += `\n- Nível de Sarcasmo: ${params.sarcasmo} (${sarcasmoDesc})`;
        }

        if (params.sensibilidade !== undefined) {
            const sensDesc = params.sensibilidade >= 0.7 ? 'Pessoa MUITO sensível - seja cuidadoso' :
                             params.sensibilidade >= 0.5 ? 'Sensibilidade moderada' :
                             'Pessoa mais resiliente';
            behavior += `\n- Sensibilidade: ${params.sensibilidade} (${sensDesc})`;
        }

        if (params.autoestima !== undefined) {
            behavior += `\n- Autoestima dela: ${params.autoestima} (${params.autoestima >= 0.8 ? 'MUITO segura' : 'moderada'})`;
        }

        if (params.dominancia !== undefined) {
            behavior += `\n- Dominância: ${params.dominancia} (${params.dominancia >= 0.6 ? 'Gosta de controlar' : 'mais passiva'})`;
        }

        // Adicionar comportamentos especiais se existirem
        if (comportamento.quando_gentil) {
            behavior += `\n\nQUANDO ELA FOR GENTIL/AMIGÁVEL:
- Tom: ${comportamento.quando_gentil.tom || 'normal'}
- Atitude: ${comportamento.quando_gentil.atitude || 'correspondente'}`;
            
            if (comportamento.quando_gentil.exemplos) {
                behavior += `\n- Exemplos de resposta: ${comportamento.quando_gentil.exemplos.slice(0, 2).join(', ')}`;
            }
        }

        if (comportamento.quando_rejeita) {
            behavior += `\n\nQUANDO ELA REJEITAR/IGNORAR:
- Tom: ${comportamento.quando_rejeita.tom || 'normal'}
- Atitude: ${comportamento.quando_rejeita.atitude || 'compreensiva'}`;
            
            if (comportamento.quando_rejeita.exemplos) {
                behavior += `\n- Exemplos de resposta: ${comportamento.quando_rejeita.exemplos.slice(0, 2).join(', ')}`;
            }
        }

        // Adicionar características específicas
        if (profile.caracteristicas_dela) {
            behavior += `\n\nCARACTERÍSTICAS DELA:`;
            Object.entries(profile.caracteristicas_dela).slice(0, 3).forEach(([key, value]) => {
                behavior += `\n- ${key}: ${value}`;
            });
        }

        return behavior;
    }

    /**
     * Constrói guia de estilo baseado nos templates existentes
     */
    buildStyleGuide(userProfile) {
        const params = userProfile?.parametros || {};
        
        let guide = `GUIA DE ESTILO E LINGUAGEM:

COMO VOCÊ FALA:
- Use linguagem natural, coloquial brasileira
- Exemplos de expressões: "mano", "cara", "pô", "aí sim", "massa"
- Seja conciso - respostas curtas e diretas (1-2 frases geralmente)
- Não seja genérico ou robótico`;

        // Adicionar exemplos baseados em afinidade
        if (params.afinidade >= 0.9) {
            guide += `\n- Com essa pessoa: use diminutivos, seja carinhoso, emojis suaves ocasionais`;
        } else if (params.afinidade >= 0.7) {
            guide += `\n- Com essa pessoa: seja amigável e receptivo`;
        } else if (params.afinidade <= 0.3) {
            guide += `\n- Com essa pessoa: mantenha distância, respostas curtas`;
        }

        // Humor e sarcasmo
        if (params.sarcasmo >= 0.6) {
            guide += `\n- Use ironia e sarcasmo quando apropriado`;
        } else if (params.sarcasmo <= 0.2) {
            guide += `\n- EVITE sarcasmo ou ironia - seja genuíno`;
        }

        guide += `\n\nEXEMPLOS DE RESPOSTAS BOAS:
- "opa, fala aí"
- "massa demais isso"
- "caraca, não sabia não"
- "nem me fala, aconteceu isso comigo também"
- "aí sim hein"

EVITE:
- Respostas longas demais
- Ser formal ou corporativo
- Usar "olá", "como posso ajudar" (muito genérico)
- Explicações desnecessárias`;

        return guide;
    }

    /**
     * Constrói contexto da mensagem atual do usuário
     */
    buildUserContext(message, context = {}) {
        let userPrompt = `Mensagem do usuário: "${message}"`;

        // Adicionar análise de sentimento se disponível
        if (context.sentiment) {
            const { classification, intensity, emotions } = context.sentiment;
            userPrompt += `\n\nSentimento detectado: ${classification} (intensidade: ${intensity.toFixed(2)})`;
            if (emotions && emotions.length > 0 && !emotions.includes('neutral')) {
                userPrompt += `\nEmoções: ${emotions.join(', ')}`;
            }
        }

        // Adicionar histórico de conversa
        if (context.history && context.history.length > 0) {
            userPrompt += `\n\nContexto da conversa recente:`;
            context.history.slice(-5).forEach(msg => {
                const author = msg.isBot ? 'Você (Daci)' : msg.author;
                const content = msg.content.substring(0, 100);
                userPrompt += `\n- ${author}: ${content}`;
            });
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

        // Adicionar menções se houver
        if (context.mentions && context.mentions.length > 0) {
            const userMentions = context.mentions.filter(m => m.type === 'user');
            if (userMentions.length > 0) {
                userPrompt += `\nMenções: ${userMentions.map(m => m.username).join(', ')}`;
            }
        }

        userPrompt += `\n\nResponda de forma natural, considerando TODO o contexto acima. Mantenha sua personalidade e adapte-se ao sentimento e situação. Seja você mesmo - o Daci.

IMPORTANTE: Responda de forma direta e concisa. NÃO faça perguntas no final da resposta a menos que seja absolutamente necessário para entender algo. Suas respostas devem ser afirmações, não questionamentos.`;

        return userPrompt;
    }

    /**
     * Calcula temperatura ideal baseada no perfil
     */
    calculateTemperature(userProfile) {
        if (!userProfile || !userProfile.parametros) {
            return 0.7; // Padrão
        }

        const params = userProfile.parametros;
        
        // Mais criatividade = temperatura mais alta
        // Mais estruturado = temperatura mais baixa
        const creativity = params.criatividade || 0.5;
        const spontaneity = params.espontaneidade || 0.5;
        
        const temperature = 0.5 + (creativity * 0.3) + (spontaneity * 0.2);
        
        // Manter entre 0.6 e 0.9
        return Math.max(0.6, Math.min(0.9, temperature));
    }

    /**
     * Detecta tipo de mensagem para ajustar resposta
     */
    detectMessageType(message) {
        const msg = message.toLowerCase();

        if (msg.match(/\b(oi|olá|hey|e aí|fala)\b/)) {
            return 'greeting';
        }
        if (msg.match(/\b(tchau|flw|até|valeu)\b/)) {
            return 'farewell';
        }
        if (msg.includes('?')) {
            return 'question';
        }
        if (msg.match(/\b(obrigad|valeu|tmj)\b/)) {
            return 'thanks';
        }
        if (msg.match(/\b(kkkk|rsrs|haha|lol)\b/)) {
            return 'laughing';
        }

        return 'statement';
    }

    /**
     * Adiciona hints específicos baseados no tipo de mensagem
     */
    addMessageTypeHints(prompt, messageType) {
        const hints = {
            greeting: 'Responda cumprimentando de volta de forma natural e amigável.',
            farewell: 'Responda se despedindo de forma casual.',
            question: 'Responda a pergunta de forma clara mas mantendo sua personalidade.',
            thanks: 'Aceite o agradecimento de forma humilde e natural.',
            laughing: 'Reaja ao humor de forma correspondente.',
            statement: 'Responda comentando ou reagindo ao que foi dito.'
        };

        return prompt + '\n\n' + (hints[messageType] || hints.statement);
    }

    /**
     * Gera prompt otimizado para comando específico
     */
    buildCommandPrompt(commandName, params, userProfile) {
        // Para comandos específicos, criar prompts focados
        const commandPrompts = {
            help: 'Explique os comandos disponíveis de forma clara e divertida',
            stats: 'Apresente as estatísticas de forma interessante',
            perfil: 'Descreva o perfil do usuário de forma personalizada'
        };

        return commandPrompts[commandName] || 'Responda adequadamente ao comando';
    }
}

module.exports = PromptBuilder;

