/**
 * Preprocessor - Camada de preparação e contextualização
 * Centraliza toda a preparação antes de enviar à IA
 */

const UserPersonality = require('../models/UserPersonality');
const PersonalityEngine = require('./PersonalityEngine');
const PromptBuilder = require('./prompt/PromptBuilder'); // Refatorado
const ContextBuilder = require('./ContextBuilder');
const SentimentAnalyzer = require('./SentimentAnalyzer');
const IntentDetector = require('./IntentDetector');
const EntityRecognizer = require('./EntityRecognizer');
const PronounResolver = require('./PronounResolver');
const ReasoningEngine = require('./reasoning/ReasoningEngine'); // NOVO: Sistema de raciocínio
const logger = require('./Logger');

class Preprocessor {
    constructor() {
        this.promptBuilder = new PromptBuilder();
        this.contextBuilder = new ContextBuilder();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.entityRecognizer = new EntityRecognizer();
        this.pronounResolver = new PronounResolver();
        this.reasoningEngine = new ReasoningEngine(); // NOVO: Sistema de raciocínio lógico
        
        // Cache de perfis de usuário (performance)
        this.profileCache = new Map(); // { userId_guildId: {profile, expiresAt} }
        this.CACHE_TTL = 10 * 60 * 1000; // 10 minutos
        
        logger.info('preprocessor', 'Preprocessor inicializado (com cache + entity recognition + reasoning)');
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
            
            // 3.5. Criar histórico híbrido inteligente (70% MemoryManager + 30% Discord)
            context.history = await this.buildHybridHistory(
                user,
                context.history, // histórico do Discord
                options.activeMemory
            );
            
            // 4. Limpar mensagem
            const cleanMessage = this.cleanMessage(message.content);
            
            // 4.5. NOVO: Extrair entidades da mensagem
            const entities = this.entityRecognizer.extractEntities(cleanMessage, user.id);
            logger.debug('preprocessor', `Entidades: ${JSON.stringify(entities)}`);
            
            // 4.6. NOVO: Resolver pronomes baseado no contexto
            const contextState = options.activeMemory || {};
            const pronounResolution = this.pronounResolver.resolve(cleanMessage, contextState);
            if (pronounResolution.resolutions.length > 0) {
                logger.debug('preprocessor', `Pronomes resolvidos: ${JSON.stringify(pronounResolution.resolutions)}`);
            }
            
            // 4.7. Detectar intenção da mensagem
            const intent = IntentDetector.detect(cleanMessage, context.history);
            logger.debug('preprocessor', `Intent detectado: ${intent.intent} (confiança: ${intent.confidence.toFixed(2)})`);
            
            // 5. Analisar sentimento
            const sentiment = this.sentimentAnalyzer.analyze(cleanMessage);
            
            // 5.5. NOVO: Executar raciocínio lógico
            const reasoning = this.reasoningEngine.analyze(cleanMessage, {
                history: context.history,
                activeMemory: options.activeMemory,
                entities,
                sentiment,
                intent
            });
            logger.debug('reasoning', `Raciocínio: ${reasoning.metadata.activeReasoners} reasoners ativos, confiança ${(reasoning.metadata.confidence * 100).toFixed(0)}%`);
            
            // 6. Construir prompt contextualizado
            const prompt = this.promptBuilder.buildPrompt(
                userProfile,
                cleanMessage,
                {
                    ...context,
                    sentiment,
                    personality: personality.parametrosFinais,
                    tipoRelacao: personality.tipoRelacao,
                    estiloResposta: personality.estiloResposta,
                    activeMemory: options.activeMemory,  // FIX: passar activeMemory para o prompt
                    entities,  // NOVO: Entidades detectadas
                    pronounResolution,  // NOVO: Pronomes resolvidos
                    reasoning  // NOVO: Insights de raciocínio lógico
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
                intent, // Intenção detectada
                entities, // NOVO: Entidades detectadas
                pronounResolution, // NOVO: Pronomes resolvidos
                reasoning, // NOVO: Insights de raciocínio lógico
                context: {
                    temporal: context.temporal,
                    conversationActive: context.history?.length > 0
                },
                activeMemory: options.activeMemory || null,
                recentTopics: options.activeMemory?.lastTopics || []
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
     * Carrega perfil do usuário (COM CACHE para performance)
     */
    loadUserProfile(userId, guildId) {
        const cacheKey = `${userId}_${guildId || 'no-guild'}`;
        const cached = this.profileCache.get(cacheKey);
        
        // Verificar se está no cache e não expirou
        if (cached && Date.now() < cached.expiresAt) {
            logger.debug('preprocessor', `Usando perfil em cache para ${userId}`);
            return cached.profile;
        }
        
        // Não está no cache ou expirou, buscar do banco
        try {
            const profile = UserPersonality.get(userId, guildId);
            
            // Armazenar no cache
            this.profileCache.set(cacheKey, {
                profile,
                expiresAt: Date.now() + this.CACHE_TTL
            });
            
            logger.debug('preprocessor', `Perfil carregado e cacheado para ${userId}`);
            return profile;
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
    
    /**
     * Constrói histórico híbrido: 70% MemoryManager + 30% Discord
     * @param {Object} user - Objeto do usuário
     * @param {Array} discordHistory - Histórico do canal do Discord
     * @param {Object} activeMemory - Memória ativa do MemoryManager
     * @returns {Array} Histórico mesclado
     */
    async buildHybridHistory(user, discordHistory = [], activeMemory = null) {
        const memoryManager = require('./memory/MemoryManager'); // Refatorado
        
        // 1. Buscar histórico do MemoryManager (conversas user-bot)
        const memoryHistory = activeMemory 
            ? memoryManager.getHistory(user.id, 10)
            : [];
        
        if (memoryHistory.length === 0) {
            // Sem histórico no MemoryManager, usar Discord
            logger.debug('preprocessor', 'Usando histórico do Discord (primeira interação)');
            return discordHistory || [];
        }
        
        // 2. Converter MemoryManager para formato ContextBuilder
        const formattedMemory = memoryHistory.map(msg => ({
            author: msg.role === 'user' ? user.username : 'Daci',
            authorId: msg.role === 'user' ? user.id : 'bot',
            content: msg.content,
            timestamp: msg.timestamp,
            isBot: msg.role === 'bot',
            source: 'memory'
        }));
        
        // 3. Pegar últimas 3 mensagens do Discord ANTES da menção (30%)
        const discordBeforeMention = (discordHistory || [])
            .filter(msg => !msg.isBot) // Só mensagens de usuários (contexto do canal)
            .slice(-3)
            .map(msg => ({
                ...msg,
                source: 'discord'
            }));
        
        // 4. Mesclar: Discord ANTES + MemoryManager (ordem cronológica)
        const hybridHistory = [
            ...discordBeforeMention,
            ...formattedMemory
        ].sort((a, b) => a.timestamp - b.timestamp);
        
        logger.debug('preprocessor', 
            `Histórico híbrido: ${discordBeforeMention.length} Discord + ${formattedMemory.length} Memory = ${hybridHistory.length} total`
        );
        
        return hybridHistory;
    }
}

module.exports = Preprocessor;

