/**
 * ModelManager - Orquestrador refatorado (modular)
 * 
 * Gerenciador de modelos de IA com fallback automático
 * Mantém API pública 100% compatível
 */

const logger = require('../Logger');
const ModelRegistry = require('./ModelRegistry');
const ModelSelector = require('./ModelSelector');

class ModelManager {
    constructor() {
        // Carregar modelos do registry
        this.models = ModelRegistry.getModels();
        
        // Criar selector
        this.selector = new ModelSelector(this.models);
        
        logger.startup('ModelManager', 'success', `${this.models.length} modelos carregados`);
        logger.info('model', `Confirmados: ${this.models.filter(m => m.category === 'confirmed').length} | Em teste: ${this.models.filter(m => m.category === 'testing').length}`);
    }

    /**
     * Reseta limites diários (delega para ModelSelector)
     */
    resetDailyLimitsIfNeeded() {
        this.selector.resetDailyLimitsIfNeeded();
    }

    /**
     * Seleciona o melhor modelo (delega para ModelSelector)
     */
    selectBestModel() {
        return this.selector.selectBestModel();
    }

    /**
     * Registra uso de modelo (delega para ModelSelector)
     */
    recordModelUsage(modelName, success = true) {
        this.selector.recordModelUsage(modelName, success);
    }

    /**
     * Obtém próximo modelo após falha (delega para ModelSelector)
     */
    getNextModel(currentModelName) {
        return this.selector.getNextModel(currentModelName);
    }

    /**
     * Obtém estatísticas (delega para ModelSelector)
     */
    getStats() {
        return this.selector.getStats();
    }

    /**
     * Lista todos os modelos
     */
    listModels() {
        return this.models.map(model => ({
            name: model.name,
            provider: model.provider,
            priority: model.priority,
            dailyLimit: model.dailyLimit,
            requestsUsed: model.requestsUsed,
            isActive: model.isActive,
            category: model.category,
            description: model.description
        }));
    }
}

module.exports = ModelManager;

