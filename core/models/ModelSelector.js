/**
 * ModelSelector - Lógica de seleção e fallback de modelos
 * 
 * Seleciona o melhor modelo disponível baseado em prioridade,
 * limites diários e disponibilidade
 */

const logger = require('../Logger');

class ModelSelector {
    constructor(models) {
        this.models = models;
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
                logger.info('model', `Limite diário resetado para ${model.name}`);
            }
        });
    }

    /**
     * Seleciona o melhor modelo disponível
     */
    selectBestModel() {
        this.resetDailyLimitsIfNeeded();
        
        // Filtrar modelos disponíveis (ativos + não atingiram limite)
        const availableModels = this.models.filter(model => 
            model.isActive && model.requestsUsed < model.dailyLimit
        );
        
        if (availableModels.length === 0) {
            logger.error('model', 'Nenhum modelo disponível! Todos atingiram o limite diário.');
            return null;
        }
        
        // Retornar o de maior prioridade (menor número = maior prioridade)
        const selected = availableModels.sort((a, b) => a.priority - b.priority)[0];
        
        logger.info('model', `Modelo selecionado: ${selected.name} (prioridade: ${selected.priority}, uso: ${selected.requestsUsed}/${selected.dailyLimit})`);
        
        return selected;
    }

    /**
     * Registra uso de um modelo
     */
    recordModelUsage(modelName, success = true) {
        const model = this.models.find(m => m.name === modelName);
        
        if (!model) {
            logger.warn('model', `Modelo ${modelName} não encontrado no registro`);
            return;
        }
        
        if (success) {
            model.requestsUsed++;
            logger.debug('model', `${model.name}: ${model.requestsUsed}/${model.dailyLimit} requisições`);
        } else {
            logger.warn('model', `Falha com modelo ${model.name}`);
        }
    }

    /**
     * Obtém o próximo modelo após uma falha
     */
    getNextModel(currentModelName) {
        this.resetDailyLimitsIfNeeded();
        
        const availableModels = this.models.filter(model => 
            model.isActive && 
            model.requestsUsed < model.dailyLimit &&
            model.name !== currentModelName
        );
        
        if (availableModels.length === 0) {
            return null;
        }
        
        return availableModels.sort((a, b) => a.priority - b.priority)[0];
    }

    /**
     * Obtém estatísticas dos modelos
     */
    getStats() {
        const confirmed = this.models.filter(m => m.category === 'confirmed').length;
        const testing = this.models.filter(m => m.category === 'testing').length;
        const active = this.models.filter(m => m.isActive).length;
        const available = this.models.filter(m => m.isActive && m.requestsUsed < m.dailyLimit).length;
        
        return {
            total: this.models.length,
            confirmed,
            testing,
            active,
            available,
            models: this.models.map(m => ({
                name: m.name,
                priority: m.priority,
                usage: `${m.requestsUsed}/${m.dailyLimit}`,
                category: m.category
            }))
        };
    }
}

module.exports = ModelSelector;

