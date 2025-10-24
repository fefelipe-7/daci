/**
 * FallbackGenerator - Sistema de fallback em 3 níveis
 * Garante que bot sempre responda algo coerente
 */

const ResponseBuilder = require('./ResponseBuilder');

class FallbackGenerator {
    /**
     * Gera fallback apropriado baseado no nível e contexto
     */
    static generate(level, pkg) {
        switch (level) {
            case 1:
                return this.level1_PersonalizedTemplates(pkg);
            case 2:
                return this.level2_ContextualGeneric(pkg);
            case 3:
            default:
                return this.level3_Emergency(pkg);
        }
    }
    
    /**
     * Nível 1: Templates Personalizados (usa ResponseBuilder)
     */
    static level1_PersonalizedTemplates(pkg) {
        try {
            const { metadata } = pkg;
            const { personality, sentiment } = metadata;
            
            if (!personality || !sentiment) {
                return this.level2_ContextualGeneric(pkg);
            }
            
            // Usar ResponseBuilder existente para gerar resposta baseada em personalidade
            const response = ResponseBuilder.gerarRespostaTemplate(
                pkg.prompt.user,
                personality.parametrosFinais,
                personality.estiloResposta,
                metadata.username,
                metadata.userId
            );
            
            return {
                content: response,
                level: 1,
                source: 'personalized_template'
            };
            
        } catch (error) {
            return this.level2_ContextualGeneric(pkg);
        }
    }
    
    /**
     * Nível 2: Templates Genéricos Contextuais
     */
    static level2_ContextualGeneric(pkg) {
        const { metadata, prompt } = pkg;
        const messageType = this.detectMessageType(prompt.user);
        
        const templates = {
            greeting: [
                'e aí, tudo certo?',
                'opa, fala aí',
                'salve, como é que tá?',
                'fala, mano'
            ],
            question: [
                'boa pergunta, deixa eu pensar...',
                'hmm, interessante isso',
                'pô, vou ter que pensar melhor sobre isso',
                'cara, não sei bem não, mas...'
            ],
            thanks: [
                'de boa, mano',
                'tranquilo',
                'tmj',
                'sempre, cara'
            ],
            farewell: [
                'flw, até mais',
                'falou, mano',
                'té logo',
                'até, valeu'
            ],
            casual: [
                'entendi, massa',
                'saquei',
                'pô, interessante',
                'é, também acho',
                'real, faz sentido'
            ]
        };
        
        const typeTemplates = templates[messageType] || templates.casual;
        const response = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
        
        return {
            content: response,
            level: 2,
            source: 'contextual_generic'
        };
    }
    
    /**
     * Nível 3: Fallback de Emergência
     */
    static level3_Emergency(pkg) {
        const emergency = [
            'pô, deu um bug aqui',
            'eita, travou tudo',
            'rapaz, bugou aqui',
            'caramba, deu ruim',
            'opa, erro aqui'
        ];
        
        const response = emergency[Math.floor(Math.random() * emergency.length)];
        
        return {
            content: response,
            level: 3,
            source: 'emergency'
        };
    }
    
    /**
     * Detecta tipo de mensagem para contexto
     */
    static detectMessageType(message) {
        if (!message || typeof message !== 'string') {
            return 'casual';
        }
        
        const lower = message.toLowerCase();
        
        if (lower.match(/\b(oi|olá|e aí|hey|fala)\b/)) {
            return 'greeting';
        }
        if (lower.includes('?')) {
            return 'question';
        }
        if (lower.match(/\b(obrigad|valeu|tmj)\b/)) {
            return 'thanks';
        }
        if (lower.match(/\b(tchau|flw|até|falou)\b/)) {
            return 'farewell';
        }
        
        return 'casual';
    }
    
    /**
     * Gera mensagem de erro específica
     */
    static generateErrorMessage(errorType) {
        const errorMessages = {
            timeout: 'pô, demorou demais, tenta de novo?',
            api_error: 'rapaz, deu erro na API aqui',
            invalid_response: 'eita, recebi uma resposta esquisita',
            rate_limit: 'calma aí, muitas mensagens de uma vez',
            unknown: 'deu um erro aqui, não sei bem o que foi'
        };
        
        return {
            content: errorMessages[errorType] || errorMessages.unknown,
            level: 3,
            source: 'error_message',
            errorType
        };
    }
}

module.exports = FallbackGenerator;

