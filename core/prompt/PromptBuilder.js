/**
 * PromptBuilder - Orquestrador refatorado (modular)
 * 
 * Constrói prompts contextualizados delegando para módulos especializados
 * Mantém API pública 100% compatível
 */

const MessageTemplates = require('../MessageTemplates.js');
const SystemPromptBuilder = require('./SystemPromptBuilder');
const StyleGuideBuilder = require('./StyleGuideBuilder');
const ContextFormatter = require('./ContextFormatter');
const HistoryCompressor = require('./HistoryCompressor');
const PromptConfig = require('./PromptConfig');

class PromptBuilder {
    constructor() {
        this.templates = MessageTemplates;
        
        // Inicializar módulos
        this.systemBuilder = new SystemPromptBuilder();
        this.styleBuilder = new StyleGuideBuilder();
        this.historyCompressor = new HistoryCompressor();
        this.contextFormatter = new ContextFormatter(this.historyCompressor);
        
        console.log('✅ PromptBuilder inicializado (modular)');
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
            maxTokens: PromptConfig.MAX_TOKENS
        };
    }

    /**
     * Constrói prompt de sistema (delega para SystemPromptBuilder)
     */
    buildSystemPrompt(userProfile) {
        return this.systemBuilder.buildSystemPrompt(userProfile);
    }

    /**
     * Constrói guia de estilo (delega para StyleGuideBuilder)
     */
    buildStyleGuide(userProfile) {
        return this.styleBuilder.buildStyleGuide(userProfile);
    }

    /**
     * Constrói contexto do usuário (delega para ContextFormatter)
     */
    buildUserContext(message, context = {}) {
        return this.contextFormatter.buildUserContext(message, context);
    }

    /**
     * Calcula temperatura ideal baseada no perfil
     */
    calculateTemperature(userProfile) {
        if (!userProfile || !userProfile.parametros) {
            return PromptConfig.DEFAULT_TEMPERATURE;
        }

        const params = userProfile.parametros;
        
        // Mais criatividade = temperatura mais alta
        const creativity = params.criatividade || 0.5;
        const spontaneity = params.espontaneidade || 0.5;
        
        const temperature = 0.4 + (creativity * 0.2) + (spontaneity * 0.15);
        
        // Manter entre MIN e MAX
        return Math.max(
            PromptConfig.MIN_TEMPERATURE, 
            Math.min(PromptConfig.MAX_TEMPERATURE, temperature)
        );
    }

    /**
     * Detecta tipo de mensagem (delega para ContextFormatter)
     */
    detectMessageType(message) {
        return this.contextFormatter.detectMessageType(message);
    }

    /**
     * Gera prompt otimizado para comando específico
     */
    buildCommandPrompt(commandName, params, userProfile) {
        const commandPrompts = {
            help: 'Explique os comandos disponíveis de forma clara e divertida',
            stats: 'Apresente as estatísticas de forma interessante',
            perfil: 'Descreva o perfil do usuário de forma personalizada'
        };

        return commandPrompts[commandName] || 'Responda adequadamente ao comando';
    }
    
    /**
     * Comprime histórico (delega para HistoryCompressor)
     */
    compressHistory(history) {
        return this.historyCompressor.compressHistory(history);
    }
    
    /**
     * Estima tokens (delega para HistoryCompressor)
     */
    estimateTokens(text) {
        return this.historyCompressor.estimateTokens(text);
    }
    
    /**
     * Extrai tópicos (delega para HistoryCompressor)
     */
    extractTopicsFromHistory(messages) {
        return this.historyCompressor.extractTopicsFromHistory(messages);
    }
    
    /**
     * Verifica entidades significativas (delega para ContextFormatter)
     */
    hasSignificantEntities(entities) {
        return this.contextFormatter.hasSignificantEntities(entities);
    }
}

module.exports = PromptBuilder;

