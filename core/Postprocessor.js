/**
 * Postprocessor - Camada de validação e entrega final
 * Garante qualidade, ajusta estilo e registra logs
 */

const StyleEnforcer = require('./StyleEnforcer');
const ResponseValidator = require('./ResponseValidator');
const FallbackGenerator = require('./FallbackGenerator');
const MetricsCollector = require('./MetricsCollector');
const logger = require('./Logger');

class Postprocessor {
    constructor(processor = null, database = null) {
        this.styleEnforcer = new StyleEnforcer(processor);
        this.metricsCollector = new MetricsCollector(database);
        
        logger.info('postprocessor', 'Postprocessor inicializado');
    }
    
    /**
     * Processa resposta bruta e retorna resposta final validada
     */
    async process(rawResponse, originalPackage) {
        const startTime = Date.now();
        let fallbackLevel = 0;
        let content = null;
        let metrics = {};
        
        try {
            // Se rawResponse é null, ir direto para fallback nível 1
            if (!rawResponse || !rawResponse.content) {
                logger.warn('postprocessor', 'Resposta bruta vazia, usando fallback nível 1');
                return await this.handleFallback(1, originalPackage, metrics);
            }
            
            content = rawResponse.content;
            metrics = rawResponse.metrics || {};
            
            // 1. Validação básica
            if (!ResponseValidator.isValid(content)) {
                logger.warn('postprocessor', 'Resposta inválida, usando fallback nível 1');
                return await this.handleFallback(1, originalPackage, metrics);
            }
            
            // 2. Analisar estilo
            const styleScore = this.styleEnforcer.analyzeStyle(content);
            logger.info('postprocessor', `Score de estilo inicial: ${styleScore.toFixed(2)}`);
            
            // 3. Aplicar StyleEnforcer se necessário
            if (styleScore < 0.7) {
                logger.info('postprocessor', 'Aplicando StyleEnforcer...');
                content = await this.styleEnforcer.enforce(content, {
                    useAI: styleScore < 0.5, // Só usar IA auxiliar se MUITO formal
                    slangIntensity: 0.3
                });
            }
            
            // 4. Aplicar transformações finais
            content = this.applyFinalTransformations(content, originalPackage);
            
            // 5. Validação final
            if (!ResponseValidator.isSafe(content)) {
                logger.warn('postprocessor', 'Resposta não passou validação de segurança, usando fallback nível 2');
                return await this.handleFallback(2, originalPackage, metrics);
            }
            
            // 6. Calcular qualidade
            const qualityScore = ResponseValidator.calculateQualityScore(content);
            logger.info('postprocessor', `Qualidade final: ${qualityScore.toFixed(2)}`);
            
            // 7. Registrar logs
            await this.logInteraction({
                ...originalPackage.metadata,
                input: originalPackage.prompt.user,
                output: content,
                model: rawResponse.model,
                responseTime: metrics.responseTime || 0,
                tokensUsed: metrics.tokensUsed || 0,
                success: true,
                fallbackLevel: 0,
                styleScore,
                qualityScore
            });
            
            const processingTime = Date.now() - startTime;
            logger.success('postprocessor', `Resposta processada em ${processingTime}ms`);
            
            return {
                content,
                status: 'validated',
                fallbackLevel: 0,
                metrics: {
                    ...metrics,
                    postprocessingTime: processingTime,
                    styleScore,
                    qualityScore
                }
            };
            
        } catch (error) {
            logger.error('postprocessor', 'Erro no pós-processamento', error);
            return await this.handleFallback(2, originalPackage, metrics);
        }
    }
    
    /**
     * Aplica transformações finais para garantir estilo Daci
     */
    applyFinalTransformations(content, package) {
        let result = content;
        
        // 1. Adicionar emojis contextuais (moderadamente)
        result = this.addContextualEmojis(result, package);
        
        // 2. Garantir que não está muito longo
        result = this.limitLength(result, 500);
        
        // 3. Limpar espaços extras
        result = result.replace(/\s{2,}/g, ' ').trim();
        
        return result;
    }
    
    /**
     * Adiciona emojis contextuais baseados no sentimento
     */
    addContextualEmojis(content, package) {
        // Não adicionar emojis se já tem muitos
        const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
        if (emojiCount >= 2) {
            return content;
        }
        
        const { sentiment } = package.metadata;
        if (!sentiment) {
            return content;
        }
        
        // Adicionar emoji baseado no sentimento (30% de chance)
        if (Math.random() < 0.3) {
            const emojiMap = {
                'very_positive': ['😊', '😄', '🎉'],
                'positive': ['😊', '👍'],
                'happy': ['😄', '😁'],
                'sad': ['😔', '😢'],
                'angry': ['😤'],
                'surprised': ['😮', '🤔'],
                'neutral': []
            };
            
            const emojis = emojiMap[sentiment.classification] || [];
            if (emojis.length > 0 && Math.random() < 0.5) {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                return content + ' ' + emoji;
            }
        }
        
        return content;
    }
    
    /**
     * Limita tamanho da resposta
     */
    limitLength(content, maxLength) {
        if (content.length <= maxLength) {
            return content;
        }
        
        // Truncar em uma frase completa se possível
        const truncated = content.substring(0, maxLength);
        const lastPeriod = Math.max(
            truncated.lastIndexOf('.'),
            truncated.lastIndexOf('!'),
            truncated.lastIndexOf('?')
        );
        
        if (lastPeriod > maxLength * 0.7) {
            return truncated.substring(0, lastPeriod + 1);
        }
        
        return truncated + '...';
    }
    
    /**
     * Manipula fallback em diferentes níveis
     */
    async handleFallback(level, package, metrics) {
        logger.warn('postprocessor', `Usando fallback nível ${level}`);
        
        const fallback = FallbackGenerator.generate(level, package);
        
        // Registrar falha
        await this.logInteraction({
            ...package.metadata,
            input: package.prompt.user,
            output: fallback.content,
            model: metrics.model || 'fallback',
            responseTime: metrics.responseTime || 0,
            tokensUsed: 0,
            success: false,
            fallbackLevel: level,
            fallbackSource: fallback.source
        });
        
        return {
            content: fallback.content,
            status: 'fallback',
            fallbackLevel: level,
            metrics: {
                ...metrics,
                fallbackUsed: true,
                fallbackSource: fallback.source
            }
        };
    }
    
    /**
     * Registra interação nos logs
     */
    async logInteraction(data) {
        try {
            await this.metricsCollector.logInteraction({
                userId: data.userId,
                guildId: data.guildId,
                input: data.input,
                output: data.output,
                model: data.model,
                responseTime: data.responseTime,
                tokensUsed: data.tokensUsed,
                success: data.success,
                fallbackLevel: data.fallbackLevel || 0,
                metadata: {
                    username: data.username,
                    personality: data.personality?.tipoRelacao,
                    sentiment: data.sentiment?.classification,
                    styleScore: data.styleScore,
                    qualityScore: data.qualityScore,
                    fallbackSource: data.fallbackSource
                }
            });
        } catch (error) {
            logger.error('postprocessor', 'Erro ao registrar log', error);
        }
    }
    
    /**
     * Obtém estatísticas
     */
    async getStats(days = 7) {
        return await this.metricsCollector.getDatabaseStats(days);
    }
}

module.exports = Postprocessor;

