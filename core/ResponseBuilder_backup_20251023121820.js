/**
 * Response Builder - Versão Mandrake Jovem 17
 * 
 * Construtor de respostas com linguagem autêntica de periferia paulista
 * Integra personalidades individuais com identidade base do bot
 */

const UserNicknames = require('./UserNicknames');
const { VOCABULARIO, APELIDOS } = require('./DaciPersonality');
const LanguageTransformer = require('./LanguageTransformer');
const MENSAGENS_PRONTAS = require('./MessageTemplates');

class ResponseBuilder {
    /**
     * Gerar resposta usando templates mandrake (sistema sem IA)
     */
    static gerarRespostaTemplate(mensagem, parametrosFinais, estiloResposta, username, userId = null) {
        const categoria = this.categorizarMensagem(mensagem);
        
        // Obter apelido do usuário
        const apelido = userId 
            ? UserNicknames.getNickname(userId)
            : username;
        
        // Escolher template baseado na categoria e contexto
        const template = this.escolherTemplateMandrake(categoria, parametrosFinais, estiloResposta);
        
        // Substituir variáveis
        const resposta = LanguageTransformer.formatarTemplate(template, {
            username: apelido,
            apelido: apelido
        });
        
        // Aplicar transformação mandrake (se necessário)
        // Templates já vêm em linguagem mandrake, então aplicamos leve
        const respostaFinal = LanguageTransformer.toMandrake(resposta, 0.3, {
            tom: estiloResposta.tom,
            provocacao: estiloResposta.provocacao
        });
        
        return respostaFinal;
    }
    
    /**
     * Escolhe template mandrake baseado em contexto
     */
    static escolherTemplateMandrake(categoria, parametros, estilo) {
        const afinidade = parametros.afinidade || 0.5;
        const sarcasmo = parametros.sarcasmo || 0.5;
        const paciencia = parametros.paciencia || 0.5;
        
        let templates = [];
        
        // Selecionar conjunto de templates baseado na categoria
        switch(categoria) {
            case 'saudacao':
                if (afinidade > 0.7) {
                    templates = MENSAGENS_PRONTAS.saudacao.alta_afinidade;
                } else if (afinidade > 0.4) {
                    templates = MENSAGENS_PRONTAS.saudacao.media_afinidade;
                } else if (afinidade < 0.3) {
                    templates = MENSAGENS_PRONTAS.saudacao.baixa_afinidade;
                } else {
                    templates = MENSAGENS_PRONTAS.saudacao.neutro;
                }
                break;
                
            case 'elogio':
                if (sarcasmo > 0.7) {
                    templates = MENSAGENS_PRONTAS.elogio.receber_elogio_sarcastico;
                } else {
                    templates = MENSAGENS_PRONTAS.elogio.receber_elogio;
                }
                break;
                
            case 'provocacao':
                if (paciencia < 0.3) {
                    templates = MENSAGENS_PRONTAS.ofensa.media;
                } else if (afinidade > 0.6) {
                    templates = MENSAGENS_PRONTAS.zoacao;
                } else {
                    templates = MENSAGENS_PRONTAS.ofensa.leve;
                }
                break;
                
            case 'pergunta':
                if (sarcasmo > 0.7 && Math.random() < 0.4) {
                    templates = MENSAGENS_PRONTAS.pergunta.pergunta_boba;
                } else {
                    templates = MENSAGENS_PRONTAS.pergunta.responder_pergunta;
                }
                break;
                
            case 'ofensa':
                if (paciencia < 0.3) {
                    templates = MENSAGENS_PRONTAS.ofensa.pesada;
                } else if (paciencia < 0.5) {
                    templates = MENSAGENS_PRONTAS.ofensa.media;
                } else {
                    templates = MENSAGENS_PRONTAS.ofensa.leve;
                }
                break;
                
            case 'casual':
            default:
                templates = MENSAGENS_PRONTAS.casual;
                break;
        }
        
        // Escolher template aleatório do conjunto
        if (templates && templates.length > 0) {
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        // Fallback
        return MENSAGENS_PRONTAS.fallback[Math.floor(Math.random() * MENSAGENS_PRONTAS.fallback.length)];
    }
    
    /**
     * Categorizar mensagem automaticamente
     */
    static categorizarMensagem(mensagem) {
        const msgLower = mensagem.toLowerCase();
        
        // Saudação
        if (msgLower.match(/\b(oi|olá|ola|e aí|eai|salve|fala|hey|hello|blz|suave|daora|tmj)\b/)) {
            return 'saudacao';
        }
        
        // Pergunta
        if (msgLower.includes('?') || msgLower.match(/\b(como|quando|onde|por que|pq|porque|qual|quem|o que|oq|cadê|cade)\b/)) {
            return 'pergunta';
        }
        
        // Elogio
        if (msgLower.match(/\b(obrigad|valeu|vlw|tmj|legal|massa|top|incrível|foda|demais|show|chave|brabo|sucesso|parabens|parabéns)\b/)) {
            return 'elogio';
        }
        
        // Ofensa/Provocação pesada
        if (msgLower.match(/\b(burro|idiota|ruim|lixo|horrível|péssimo|merda|bosta|cuzao|cuzão|fdp|vai se fude|vsf|otario|otário)\b/)) {
            return 'ofensa';
        }
        
        // Provocação leve
        if (msgLower.match(/\b(desafio|aposto|ta errado|tá errado|vacilou|pagou mico|se acha|viaja|brisa|doido|loko|maluco)\b/)) {
            return 'provocacao';
        }
        
        // Default: casual
        return 'casual';
    }
}

module.exports = ResponseBuilder;

