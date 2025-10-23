/**
 * ModelManager - Gerenciador de modelos de IA com fallback automático
 * Gerencia múltiplos modelos gratuitos do OpenRouter com prioridades e limites diários
 */

class ModelManager {
    constructor() {
        // Lista de modelos disponíveis com suas configurações
        // Modelos gratuitos do OpenRouter - APENAS OS QUE FUNCIONAM + NOVOS PARA TESTE
        this.models = [
            // === MODELOS FUNCIONANDO (CONFIRMADOS) - META LLAMA PRIORITÁRIOS ===
            {
                name: 'meta-llama/llama-3.3-8b-instruct:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 1,
                dailyLimit: 1500,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'Llama 3.3 8B - Última versão do Meta (PRIORIDADE MÁXIMA)'
            },
            {
                name: 'nvidia/nemotron-nano-9b-v2:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 2,
                dailyLimit: 2000,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'Modelo NVIDIA otimizado para conversação'
            },
            {
                name: 'deepseek/deepseek-chat-v3.1:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 3,
                dailyLimit: 1500,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'DeepSeek Chat v3.1 - Excelente para diálogos'
            },
            {
                name: 'moonshotai/kimi-dev-72b:free',
                provider: 'OpenRouter',
                maxTokens: 2048,
                temperature: 0.7,
                priority: 4,
                dailyLimit: 800,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'Kimi Dev 72B - Versão de desenvolvimento'
            },
            {
                name: 'mistralai/mistral-small-3.2-24b-instruct:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 5,
                dailyLimit: 1200,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'Mistral Small 3.2 - Modelo francês eficiente'
            },
            {
                name: 'qwen/qwen3-coder:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 6,
                dailyLimit: 1000,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'Qwen3 Coder - Especializado em programação'
            },
            {
                name: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 7,
                dailyLimit: 800,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'Dolphin Mistral - Modelo fine-tuned'
            },
            {
                name: 'google/gemma-3n-e2b-it:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 8,
                dailyLimit: 1000,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'confirmed',
                description: 'Gemma 3N - Modelo Google otimizado'
            },
            
            // === NOVOS MODELOS PARA TESTE ===
            {
                name: 'mistralai/mistral-7b-instruct:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 11,
                dailyLimit: 1500,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Mistral 7B Instruct - Modelo compacto e eficiente'
            },
            {
                name: 'google/gemma-2-9b-it:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 12,
                dailyLimit: 1200,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Gemma 2 9B IT - Nova versão Google'
            },
            {
                name: 'mistralai/mistral-nemo:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 13,
                dailyLimit: 1000,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Mistral Nemo - Modelo experimental'
            },
            {
                name: 'qwen/qwen-2.5-72b-instruct:free',
                provider: 'OpenRouter',
                maxTokens: 2048,
                temperature: 0.7,
                priority: 14,
                dailyLimit: 800,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Qwen 2.5 72B - Modelo grande e poderoso'
            },
            {
                name: 'meta-llama/llama-3.3-70b-instruct:free',
                provider: 'OpenRouter',
                maxTokens: 2048,
                temperature: 0.7,
                priority: 9,
                dailyLimit: 600,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Llama 3.3 70B - Modelo grande e avançado (META PRIORIDADE)'
            },
            {
                name: 'meta-llama/llama-3.2-3b-instruct:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 10,
                dailyLimit: 2000,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Llama 3.2 3B - Modelo leve e rápido (META PRIORIDADE)'
            },
            {
                name: 'google/gemini-2.0-flash-exp:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 15,
                dailyLimit: 1000,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Gemini 2.0 Flash Experimental - Nova versão Google'
            },
            {
                name: 'deepseek/deepseek-r1-distill-llama-70b:free',
                provider: 'OpenRouter',
                maxTokens: 2048,
                temperature: 0.7,
                priority: 16,
                dailyLimit: 600,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'DeepSeek R1 Distill Llama 70B - Modelo de raciocínio'
            },
            {
                name: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
                provider: 'OpenRouter',
                maxTokens: 1024,
                temperature: 0.7,
                priority: 17,
                dailyLimit: 800,
                requestsUsed: 0,
                lastReset: Date.now(),
                isActive: true,
                category: 'testing',
                description: 'Dolphin 3.0 Mistral 24B - Nova versão fine-tuned'
            }
        ];

        // Ordenar modelos por prioridade
        this.models.sort((a, b) => a.priority - b.priority);
        
        console.log(`✅ ModelManager inicializado com ${this.models.length} modelos`);
        console.log(`📊 Modelos confirmados: ${this.models.filter(m => m.category === 'confirmed').length}`);
        console.log(`🧪 Modelos em teste: ${this.models.filter(m => m.category === 'testing').length}`);
    }

    /**
     * Reseta os limites diários se já passou 24h
     */
    resetDailyLimitsIfNeeded() {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        this.models.forEach(model => {
            if (now - model.lastReset > oneDayMs) {
                model.requestsUsed = 0;
                model.lastReset = now;
                model.isActive = true;
                console.log(`🔄 Reset diário: ${model.name}`);
            }
        });
    }

    /**
     * Seleciona o melhor modelo disponível baseado em prioridade e limites
     */
    selectBestModel() {
        this.resetDailyLimitsIfNeeded();

        // Encontrar primeiro modelo disponível
        const availableModel = this.models.find(model => 
            model.isActive && model.requestsUsed < model.dailyLimit
        );

        if (availableModel) {
            return availableModel;
        }

        // Se nenhum modelo disponível, reativar o de maior prioridade
        const bestModel = this.models[0];
        bestModel.isActive = true;
        bestModel.requestsUsed = 0;
        console.warn('⚠️ Todos os modelos atingiram limite. Resetando modelo prioritário.');
        return bestModel;
    }

    /**
     * Registra uso de um modelo
     */
    recordModelUsage(modelName, success = true) {
        const model = this.models.find(m => m.name === modelName);
        if (model) {
            model.requestsUsed++;
            
            // Desativar se atingiu limite
            if (model.requestsUsed >= model.dailyLimit) {
                model.isActive = false;
                console.warn(`⚠️ Modelo ${modelName} atingiu limite diário (${model.dailyLimit})`);
            }

            // Log de progresso
            const percentUsed = ((model.requestsUsed / model.dailyLimit) * 100).toFixed(1);
            console.log(`📊 ${modelName}: ${model.requestsUsed}/${model.dailyLimit} (${percentUsed}%)`);
        }
    }

    /**
     * Obtém próximo modelo disponível (fallback)
     */
    getNextModel(currentModelName) {
        const currentIndex = this.models.findIndex(m => m.name === currentModelName);
        
        // Procurar próximo modelo disponível
        for (let i = currentIndex + 1; i < this.models.length; i++) {
            const model = this.models[i];
            if (model.isActive && model.requestsUsed < model.dailyLimit) {
                console.log(`🔄 Fallback: ${currentModelName} → ${model.name}`);
                return model;
            }
        }

        // Se não encontrou, voltar ao início
        return this.selectBestModel();
    }

    /**
     * Obtém estatísticas de uso
     */
    getStats() {
        const stats = {
            totalModels: this.models.length,
            activeModels: this.models.filter(m => m.isActive).length,
            totalRequests: this.models.reduce((sum, m) => sum + m.requestsUsed, 0),
            byCategory: {
                confirmed: this.models.filter(m => m.category === 'confirmed').length,
                testing: this.models.filter(m => m.category === 'testing').length
            },
            topUsed: [...this.models]
                .sort((a, b) => b.requestsUsed - a.requestsUsed)
                .slice(0, 5)
                .map(m => ({
                    name: m.name.split('/')[1],
                    used: m.requestsUsed,
                    limit: m.dailyLimit
                }))
        };

        return stats;
    }

    /**
     * Lista todos os modelos e seus status
     */
    listModels() {
        return this.models.map(m => ({
            name: m.name,
            description: m.description,
            priority: m.priority,
            category: m.category,
            isActive: m.isActive,
            usage: `${m.requestsUsed}/${m.dailyLimit}`,
            percentUsed: ((m.requestsUsed / m.dailyLimit) * 100).toFixed(1) + '%'
        }));
    }
}

module.exports = ModelManager;

