/**
 * ModelRegistry - Registro completo de modelos de IA
 * 
 * Lista de todos os modelos gratuitos do OpenRouter com configurações
 */

const MODELS = [
    // === MODELOS FUNCIONANDO (CONFIRMADOS) - META LLAMA PRIORITÁRIOS ===
    {
        name: 'meta-llama/llama-3.3-8b-instruct:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
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
        temperature: 0.65,
        priority: 17,
        dailyLimit: 800,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Dolphin 3.0 Mistral 24B - Nova versão fine-tuned'
    }
];

module.exports = {
    /**
     * Retorna lista de todos os modelos ordenados por prioridade
     */
    getModels() {
        return MODELS.slice().sort((a, b) => a.priority - b.priority);
    },
    
    /**
     * Retorna apenas modelos confirmados
     */
    getConfirmed() {
        return MODELS.filter(m => m.category === 'confirmed');
    },
    
    /**
     * Retorna apenas modelos em teste
     */
    getTesting() {
        return MODELS.filter(m => m.category === 'testing');
    }
};

