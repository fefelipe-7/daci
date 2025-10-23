/**
 * AIService - Serviço principal de IA integrado com OpenRouter
 * Gerencia comunicação com API, fallback de modelos e contexto personalizado
 */

const fetch = require('node-fetch');
const ModelManager = require('./ModelManager.js');
const PromptBuilder = require('./PromptBuilder.js');

class AIService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('OPENROUTE_KEY não configurada no .env');
        }

        this.apiKey = apiKey;
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
        this.modelManager = new ModelManager();
        this.promptBuilder = new PromptBuilder();
        
        // Cache de perfis para performance
        this.profileCache = new Map();
        
        // Estatísticas
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };

        console.log('✅ AIService inicializado com OpenRouter');
        console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
    }

    /**
     * Gera resposta personalizada para um usuário
     */
    async generateResponse(message, userProfile, context = {}) {
        const startTime = Date.now();
        this.stats.totalRequests++;

        try {
            // Selecionar melhor modelo disponível
            let model = this.modelManager.selectBestModel();
            console.log(`🤖 Usando modelo: ${model.name} (prioridade ${model.priority})`);

            // Construir prompt contextualizado
            const prompt = this.promptBuilder.buildPrompt(userProfile, message, context);
            
            // Tentar gerar resposta (com fallback automático)
            const response = await this.generateWithFallback(prompt, model);

            // Registrar sucesso
            const responseTime = Date.now() - startTime;
            this.recordSuccess(responseTime);

            console.log(`✅ Resposta gerada em ${responseTime}ms`);
            return response;

        } catch (error) {
            this.stats.failedRequests++;
            console.error('❌ Erro ao gerar resposta:', error.message);
            
            // Retornar resposta de fallback
            return this.getFallbackResponse(message, userProfile);
        }
    }

    /**
     * Tenta gerar resposta com fallback automático entre modelos
     */
    async generateWithFallback(prompt, initialModel, maxAttempts = 3) {
        let currentModel = initialModel;
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            try {
                const response = await this.callOpenRouter(prompt, currentModel);
                
                // Registrar uso do modelo
                this.modelManager.recordModelUsage(currentModel.name, true);
                
                return response;

            } catch (error) {
                console.warn(`⚠️ Tentativa ${attempts} falhou com ${currentModel.name}: ${error.message}`);
                
                // Registrar falha
                this.modelManager.recordModelUsage(currentModel.name, false);

                // Se não for última tentativa, tentar próximo modelo
                if (attempts < maxAttempts) {
                    currentModel = this.modelManager.getNextModel(currentModel.name);
                    console.log(`🔄 Tentando modelo: ${currentModel.name}`);
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
    async callOpenRouter(prompt, model) {
        const requestBody = {
            model: model.name,
            messages: [
                {
                    role: 'system',
                    content: prompt.system
                },
                {
                    role: 'user',
                    content: prompt.user
                }
            ],
            temperature: prompt.temperature || model.temperature,
            max_tokens: prompt.maxTokens || model.maxTokens,
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
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

        // Validar resposta
        if (!generatedText || generatedText.length < 2) {
            throw new Error('Resposta vazia ou inválida');
        }

        return generatedText;
    }

    /**
     * Resposta de fallback quando IA falha
     */
    getFallbackResponse(message, userProfile) {
        const fallbacks = [
            "pô, deu um bug aqui, não consegui processar direito",
            "caraca, travou tudo aqui haha, tenta de novo?",
            "opa, acho que não entendi direito, reformula aí?",
            "rapaz, bugou aqui, me perdoa",
            "eita, deu ruim no processamento, tenta outra vez?"
        ];

        // Personalizar um pouco baseado em afinidade
        const afinidade = userProfile?.parametros?.afinidade || 0.5;
        if (afinidade >= 0.9) {
            return "ai, desculpa! deu um probleminha aqui 🥺 tenta de novo?";
        }

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    /**
     * Registra sucesso e atualiza estatísticas
     */
    recordSuccess(responseTime) {
        this.stats.successfulRequests++;
        this.stats.totalResponseTime += responseTime;
        this.stats.averageResponseTime = Math.round(
            this.stats.totalResponseTime / this.stats.successfulRequests
        );
    }

    /**
     * Obtém estatísticas do serviço
     */
    getStats() {
        const modelStats = this.modelManager.getStats();
        
        return {
            ai: {
                totalRequests: this.stats.totalRequests,
                successful: this.stats.successfulRequests,
                failed: this.stats.failedRequests,
                successRate: this.stats.totalRequests > 0 
                    ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(1) + '%'
                    : '0%',
                avgResponseTime: this.stats.averageResponseTime + 'ms'
            },
            models: modelStats
        };
    }

    /**
     * Lista modelos disponíveis
     */
    listAvailableModels() {
        return this.modelManager.listModels();
    }

    /**
     * Reseta estatísticas
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };
        console.log('📊 Estatísticas resetadas');
    }

    /**
     * Testa conexão com OpenRouter
     */
    async testConnection() {
        try {
            console.log('🧪 Testando conexão com OpenRouter...');
            
            const testPrompt = {
                system: 'Você é um assistente de teste. Responda apenas "OK".',
                user: 'Teste de conexão',
                temperature: 0.7,
                maxTokens: 10
            };

            const model = this.modelManager.selectBestModel();
            const response = await this.callOpenRouter(testPrompt, model);

            console.log('✅ Conexão com OpenRouter OK');
            console.log(`📝 Resposta de teste: "${response}"`);
            
            return { success: true, model: model.name, response };

        } catch (error) {
            console.error('❌ Falha no teste de conexão:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Gera resposta para comando específico
     */
    async generateCommandResponse(commandName, params, userProfile) {
        const prompt = this.promptBuilder.buildCommandPrompt(commandName, params, userProfile);
        return await this.generateResponse(prompt, userProfile, { isCommand: true });
    }

    /**
     * Limpa cache de perfis
     */
    clearProfileCache() {
        this.profileCache.clear();
        console.log('🗑️ Cache de perfis limpo');
    }
}

module.exports = AIService;

