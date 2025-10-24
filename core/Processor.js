/**
 * Processor - Camada de execução de IA
 * Responsável APENAS por executar chamadas à IA e coletar métricas
 * Sem lógica de fallback (isso fica no Postprocessor)
 */

// Importar fetch (usa global do Node.js 18+ ou fallback para node-fetch v2)
const fetch = global.fetch || require('node-fetch');
const ModelManager = require('./ModelManager.js');
const logger = require('./Logger.js');

class Processor {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('OPENROUTE_KEY não configurada no .env');
        }

        this.apiKey = apiKey;
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
        this.modelManager = new ModelManager();
        
        logger.info('processor', 'Processor inicializado');
    }

    /**
     * Processa pacote do Preprocessor e executa chamada à IA
     */
    async process(pkg) {
        const startTime = Date.now();
        
        // Selecionar melhor modelo disponível
        const model = this.modelManager.selectBestModel();
        logger.info('processor', `Modelo selecionado: ${model.name.split('/')[1]}`);
        
        try {
            // Executar chamada à IA com fallback automático de modelos
            const response = await this.executeWithFallback(pkg, model);
            
            // Coletar métricas
            const metrics = {
                model: model.name,
                responseTime: Date.now() - startTime,
                tokensUsed: response.usage?.total_tokens || 0,
                cost: this.estimateCost(response.usage)
            };
            
            logger.success('processor', `Resposta gerada em ${metrics.responseTime}ms`);
            
            return {
                content: response.content,
                metadata: pkg.metadata,
                metrics,
                model: model.name
            };
            
        } catch (error) {
            const metrics = {
                model: model.name,
                responseTime: Date.now() - startTime,
                tokensUsed: 0,
                cost: 0
            };
            
            logger.error('processor', 'Falha ao processar', error);
            
            // Lançar erro para que Postprocessor trate
            throw {
                message: error.message,
                metrics,
                model: model.name
            };
        }
    }

    /**
     * Executa chamada com fallback automático entre modelos
     */
    async executeWithFallback(pkg, initialModel, maxAttempts = 3) {
        let currentModel = initialModel;
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            try {
                const response = await this.callOpenRouter(pkg, currentModel);
                
                // Registrar uso bem-sucedido
                this.modelManager.recordModelUsage(currentModel.name, true);
                
                return response;

            } catch (error) {
                logger.warn('processor', `Tentativa ${attempts} falhou com ${currentModel.name.split('/')[1]}: ${error.message}`);
                
                // Registrar falha
                this.modelManager.recordModelUsage(currentModel.name, false);

                // Se não for última tentativa, tentar próximo modelo
                if (attempts < maxAttempts) {
                    const nextModel = this.modelManager.getNextModel(currentModel.name);
                    logger.info('processor', `Fallback: ${currentModel.name.split('/')[1]} → ${nextModel.name.split('/')[1]}`);
                    currentModel = nextModel;
                } else {
                    throw error;
                }
            }
        }

        throw new Error('Todos os modelos falharam após múltiplas tentativas');
    }

    /**
     * Faz chamada para OpenRouter API
     */
    async callOpenRouter(pkg, model) {
        const requestBody = {
            model: model.name,
            messages: [
                {
                    role: 'system',
                    content: pkg.prompt.system
                },
                {
                    role: 'user',
                    content: pkg.prompt.user
                }
            ],
            temperature: pkg.parameters.temperature || model.temperature,
            max_tokens: pkg.parameters.maxTokens || model.maxTokens,
            top_p: pkg.parameters.topP || 0.9,
            frequency_penalty: pkg.parameters.frequencyPenalty || 0.5,
            presence_penalty: pkg.parameters.presencePenalty || 0.5
        };

        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://github.com/daci-bot',
                'X-Title': 'DACI Discord Bot'
            },
            body: JSON.stringify(requestBody),
            timeout: 30000 // 30 segundos
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Resposta inválida da API');
        }

        const generatedText = data.choices[0].message.content.trim();

        // Validar resposta básica
        if (!generatedText || generatedText.length < 2) {
            throw new Error('Resposta vazia ou inválida');
        }

        return {
            content: generatedText,
            usage: data.usage
        };
    }

    /**
     * Estima custo da requisição
     */
    estimateCost(usage) {
        if (!usage) return 0;
        
        // Modelos free não têm custo
        return 0;
    }

    /**
     * Testa conexão com OpenRouter
     */
    async testConnection() {
        try {
            logger.info('processor', 'Testando conexão com OpenRouter...');
            
            const testPackage = {
                prompt: {
                    system: 'Você é um assistente de teste. Responda apenas "OK".',
                    user: 'Teste de conexão'
                },
                parameters: {
                    temperature: 0.9,
                    maxTokens: 10
                },
                metadata: {
                    userId: 'test',
                    username: 'test'
                }
            };

            const result = await this.process(testPackage);
            
            logger.success('processor', 'Conexão com OpenRouter OK');
            logger.info('processor', `Resposta de teste: "${result.content}"`);
            
            return { success: true, model: result.model, response: result.content };

        } catch (error) {
            logger.error('processor', 'Falha no teste de conexão', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtém estatísticas do processador
     */
    getStats() {
        return this.modelManager.getStats();
    }

    /**
     * Lista modelos disponíveis
     */
    listModels() {
        return this.modelManager.listModels();
    }
}

module.exports = Processor;

