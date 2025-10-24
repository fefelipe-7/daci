/**
 * Preprocessor - Camada de preparação e contextualização
 * Centraliza toda a preparação antes de enviar à IA
 */

const UserPersonality = require('../models/UserPersonality');
const PersonalityEngine = require('./PersonalityEngine');
const PromptBuilder = require('./PromptBuilder');
const ContextBuilder = require('./ContextBuilder');
const SentimentAnalyzer = require('./SentimentAnalyzer');
const logger = require('./Logger');

class Preprocessor {
    constructor() {
        this.promptBuilder = new PromptBuilder();
        this.contextBuilder = new ContextBuilder();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        
        logger.info('preprocessor', 'Preprocessor inicializado');
    }
    
    /**
     * Processa mensagem e prepara pacote completo para IA
     */
    async process(message, options = {}) {
        const startTime = Date.now();
        
        try {
            const { user, channel, guild } = options;
            
            // 1. Carregar perfil do usuário
            const userProfile = this.loadUserProfile(user.id, guild?.id);
            
            // 2. Processar personalidade composta
            const personality = PersonalityEngine.processarPerfil(userProfile);
            
            // 3. Buscar contexto situacional e histórico
            const context = await this.contextBuilder.build({
                channel,
                message,
                guild,
                historyLimit: 10
            });
            
            // 4. Limpar mensagem
            const cleanMessage = this.cleanMessage(message.content);
            
            // 5. Analisar sentimento
            const sentiment = this.sentimentAnalyzer.analyze(cleanMessage);
            
            // 6. Construir prompt contextualizado
            const prompt = this.promptBuilder.buildPrompt(
                userProfile,
                cleanMessage,
                {
                    ...context,
                    sentiment,
                    personality: personality.parametrosFinais,
                    tipoRelacao: personality.tipoRelacao,
                    estiloResposta: personality.estiloResposta
                }
            );
            
            // 7. Definir parâmetros do modelo
            const parameters = this.defineModelParameters(personality, sentiment, context);
            
            // 8. Montar metadata
            const metadata = {
                userId: user.id,
                username: user.username,
                guildId: guild?.id,
                channelId: channel?.id,
                messageId: message.id,
                timestamp: Date.now(),
                personality,
                sentiment,
                context: {
                    temporal: context.temporal,
                    conversationActive: context.history?.length > 0
                }
            };
            
            const processingTime = Date.now() - startTime;
            logger.info('preprocessor', `Pacote preparado em ${processingTime}ms`);
            
            return {
                prompt,
                parameters,
                metadata
            };
            
        } catch (error) {
            logger.error('preprocessor', 'Erro ao processar', error);
            throw error;
        }
    }
    
    /**
     * Carrega perfil do usuário
     */
    loadUserProfile(userId, guildId) {
        try {
            return UserPersonality.get(userId, guildId);
        } catch (error) {
            logger.warn('preprocessor', `Erro ao carregar perfil de ${userId}, usando padrão`);
            return UserPersonality.get(userId, guildId); // Retorna perfil padrão
        }
    }
    
    /**
     * Limpa mensagem removendo menções e espaços extras
     */
    cleanMessage(content) {
        if (!content) return '';
        
        return content
            .replace(/<@!?\d+>/g, '') // Remove menções
            .replace(/<#\d+>/g, '')   // Remove menções de canal
            .replace(/<@&\d+>/g, '')  // Remove menções de role
            .trim();
    }
    
    /**
     * Define parâmetros do modelo baseado em personalidade e sentimento
     */
    defineModelParameters(personality, sentiment, context) {
        const { parametrosFinais } = personality;
        
        // Temperatura base do PromptBuilder
        let temperature = this.promptBuilder.calculateTemperature({ parametros: parametrosFinais });
        
        // Ajustar temperatura baseado no sentimento
        if (sentiment.intensity > 0.7) {
            // Alta intensidade emocional = resposta mais consistente
            temperature = Math.max(temperature - 0.1, 0.6);
        }
        
        // Ajustar baseado no contexto temporal
        if (context.temporal?.mood === 'sleepy') {
            // De madrugada, respostas mais curtas e diretas
            temperature = Math.max(temperature - 0.1, 0.6);
        }
        
        // Max tokens baseado no contexto
        let maxTokens = 256;
        if (sentiment.classification.includes('question') || context.history?.length > 5) {
            // Perguntas ou conversas longas podem precisar de respostas um pouco maiores
            maxTokens = 350;
        }
        
        return {
            temperature: Math.round(temperature * 100) / 100,
            maxTokens,
            topP: 0.9,
            frequencyPenalty: 0.5,
            presencePenalty: 0.5
        };
    }
    
    /**
     * Analisa se contexto está completo e válido
     */
    validatePackage(pkg) {
        if (!pkg.prompt || !pkg.prompt.system || !pkg.prompt.user) {
            throw new Error('Prompt incompleto');
        }
        
        if (!pkg.parameters || !pkg.parameters.temperature) {
            throw new Error('Parâmetros incompletos');
        }
        
        if (!pkg.metadata || !pkg.metadata.userId) {
            throw new Error('Metadata incompleta');
        }
        
        return true;
    }
    
    /**
     * Gera resumo do pacote para debug
     */
    summarize(pkg) {
        return {
            user: pkg.metadata.username,
            sentiment: pkg.metadata.sentiment.classification,
            intensity: pkg.metadata.sentiment.intensity.toFixed(2),
            personality: pkg.metadata.personality.tipoRelacao,
            temperature: pkg.parameters.temperature,
            historySize: pkg.metadata.context.conversationActive ? 'yes' : 'no',
            promptLength: pkg.prompt.system.length + pkg.prompt.user.length
        };
    }
}

module.exports = Preprocessor;

