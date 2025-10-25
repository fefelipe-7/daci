/**
 * ResponseBuilder - Orquestrador refatorado (modular)
 * 
 * Sistema de respostas personalizadas delegando para módulos especializados
 * Mantém API pública 100% compatível
 */

const UserNicknames = require('../UserNicknames');
const { VOCABULARIO, APELIDOS, EMOJIS } = require('../personality/DaciPersonality');
const LanguageTransformer = require('../LanguageTransformer');
const MENSAGENS_PRONTAS = require('../templates');
const ContextAnalyzer = require('./ContextAnalyzer');
const TemplateSelector = require('./TemplateSelector');
const ResponseGenerator = require('./ResponseGenerator');

class ResponseBuilder {
    constructor() {
        this.selector = new TemplateSelector(MENSAGENS_PRONTAS);
        this.generator = new ResponseGenerator();
    }

    /**
     * Gerar resposta template (método principal - compatível com API antiga)
     */
    static gerarRespostaTemplate(mensagem, parametrosFinais, estiloResposta, username, userId = null) {
        // 1. Analisar contexto profundo
        const analiseContexto = ContextAnalyzer.analisarContextoProfundo(mensagem);
        
        // 2. Obter apelido personalizado
        const apelido = userId ? UserNicknames.getNickname(userId) : username;
        
        // 3. Calcular nível emocional
        const nivelEmocional = ContextAnalyzer.calcularNivelEmocional(parametrosFinais, analiseContexto);
        
        // 4. Escolher template perfeito
        const instance = new ResponseBuilder();
        const template = instance.selector.escolherTemplate(
            analiseContexto, 
            parametrosFinais, 
            estiloResposta,
            nivelEmocional,
            apelido
        );
        
        // 5. Gerar resposta final
        const respostaFinal = instance.generator.generate(
            template,
            { parametros: parametrosFinais, estilo: estiloResposta },
            apelido,
            analiseContexto,
            parametrosFinais,
            estiloResposta
        );
        
        return respostaFinal;
    }
    
    // ===== MÉTODOS DE COMPATIBILIDADE (delegam para ContextAnalyzer) =====
    
    static analisarContextoProfundo(mensagem) {
        return ContextAnalyzer.analisarContextoProfundo(mensagem);
    }
    
    static detectarCategoria(msgLower) {
        return ContextAnalyzer.detectarCategoria(msgLower);
    }
    
    static detectarEmocao(msgLower) {
        return ContextAnalyzer.detectarEmocao(msgLower);
    }
    
    static detectarIntensidade(msgLower) {
        return ContextAnalyzer.detectarIntensidade(msgLower);
    }
    
    static detectarIntencao(msgLower) {
        return ContextAnalyzer.detectarIntencao(msgLower);
    }
    
    static extrairPalavrasChave(msgLower) {
        return ContextAnalyzer.extrairPalavrasChave(msgLower);
    }
    
    static calcularNivelEmocional(parametros, analise) {
        return ContextAnalyzer.calcularNivelEmocional(parametros, analise);
    }
}

module.exports = ResponseBuilder;

