/**
 * MEGA Response Builder - Versão Avançada 2.0
 * 
 * Sistema de respostas EXTREMAMENTE personalizado baseado em:
 * - Análise profunda de contexto
 * - 500+ templates de mensagens
 * - 15 parâmetros de personalidade
 * - Detecção de emoções e intenções
 * - Histórico de interações (futuro)
 */

const UserNicknames = require('./UserNicknames');
const { VOCABULARIO, APELIDOS, EMOJIS } = require('./DaciPersonality');
const LanguageTransformer = require('./LanguageTransformer');
const MENSAGENS_PRONTAS = require('./MessageTemplates_EXPANDED');

class ResponseBuilder {
    /**
     * Gerar resposta ULTRA personalizada
     */
    static gerarRespostaTemplate(mensagem, parametrosFinais, estiloResposta, username, userId = null) {
        // 1. Analisar contexto PROFUNDO da mensagem
        const analiseContexto = this.analisarContextoProfundo(mensagem);
        
        // 2. Obter apelido personalizado
        const apelido = userId ? UserNicknames.getNickname(userId) : username;
        
        // 3. Calcular nível emocional baseado nos parâmetros
        const nivelEmocional = this.calcularNivelEmocional(parametrosFinais, analiseContexto);
        
        // 4. Escolher template PERFEITO baseado em TUDO
        const template = this.escolherTemplateMegaAvancado(
            analiseContexto, 
            parametrosFinais, 
            estiloResposta,
            nivelEmocional,
            apelido
        );
        
        // 5. Substituir variáveis com contexto
        const resposta = LanguageTransformer.formatarTemplate(template, {
            username: apelido,
            apelido: apelido
        });
        
        // 6. Aplicar transformação mandrake ADAPTATIVA
        const intensidadeMandrake = this.calcularIntensidadeMandrake(parametrosFinais, analiseContexto);
        const respostaFinal = LanguageTransformer.toMandrake(resposta, intensidadeMandrake, {
            tom: estiloResposta.tom,
            provocacao: estiloResposta.provocacao,
            contexto: analiseContexto.categoria
        });
        
        return respostaFinal;
    }
    
    /**
     * ANÁLISE DE CONTEXTO PROFUNDA - Detecta múltiplas camadas
     */
    static analisarContextoProfundo(mensagem) {
        const msgLower = mensagem.toLowerCase();
        
        return {
            categoria: this.detectarCategoria(msgLower),
            emocao: this.detectarEmocao(msgLower),
            intensidade: this.detectarIntensidade(msgLower),
            intencao: this.detectarIntencao(msgLower),
            palavrasChave: this.extrairPalavrasChave(msgLower),
            tamanho: mensagem.length,
            temEmoji: /[\u{1F300}-\u{1F9FF}]/u.test(mensagem),
            temExclamacao: mensagem.includes('!'),
            temInterrogacao: mensagem.includes('?'),
            ehCapitalized: mensagem === mensagem.toUpperCase()
        };
    }
    
    /**
     * Detectar categoria principal (MEGA expandido - 15+ categorias)
     */
    static detectarCategoria(msgLower) {
        // SAUDAÇÃO
        if (msgLower.match(/\b(oi|olá|ola|e aí|eai|e ai|salve|fala|hey|hello|blz|suave|daora|tmj|opa|bom dia|boa tarde|boa noite)\b/)) {
            return 'saudacao';
        }
        
        // DESPEDIDA
        if (msgLower.match(/\b(tchau|flw|vlw|até|falou|até mais|até logo|fuiiiii|vou nessa|to indo|tamo junto|tmj)\b/)) {
            return 'despedida';
        }
        
        // AGRADECIMENTO
        if (msgLower.match(/\b(obrigad|valeu|vlw|tmj|agradeço|agradeco|thanks|obg|brigadão|brigadao)\b/)) {
            return 'agradecer';
        }
        
        // ELOGIO
        if (msgLower.match(/\b(legal|massa|top|incrível|foda|demais|show|chave|brabo|sucesso|parabens|parabéns|maneiro|daora|pika|foda|mt bom|bom demais)\b/)) {
            return 'elogio';
        }
        
        // OFENSA PESADA
        if (msgLower.match(/\b(burro|idiota|ruim|lixo|horrível|péssimo|merda|bosta|cuzao|cuzão|fdp|vai se fude|vsf|otario|otário|escroto|filho da puta|vai tomar no cu)\b/)) {
            return 'ofensa';
        }
        
        // PROVOCAÇÃO
        if (msgLower.match(/\b(desafio|aposto|ta errado|tá errado|vacilou|pagou mico|se acha|viaja|brisa|doido|loko|maluco|pirou|surtou)\b/)) {
            return 'provocacao';
        }
        
        // PERGUNTA
        if (msgLower.includes('?') || msgLower.match(/\b(como|quando|onde|por que|pq|porque|qual|quem|o que|oq|cadê|cade|me explica|me fala|conta)\b/)) {
            return 'pergunta';
        }
        
        // PEDIDO DE AJUDA
        if (msgLower.match(/\b(me ajuda|ajuda|preciso|socorro|help|me salva|da uma força|força ai|bora me ajudar)\b/)) {
            return 'ajuda';
        }
        
        // CONFUSÃO/DÚVIDA
        if (msgLower.match(/\b(hã|oi\?|como assim|n entendi|nao entendi|não entendi|repete|fala dnv|explica|wtf|q isso|que isso)\b/)) {
            return 'confusao';
        }
        
        // CONCORDÂNCIA
        if (msgLower.match(/\b(sim|exato|isso ai|isso aí|verdade|concordo|real|certinho|tmj|é isso|facts|certeza|com ctz)\b/)) {
            return 'concordar';
        }
        
        // DISCORDÂNCIA
        if (msgLower.match(/\b(não|nao|nem|nada a ver|discordo|ta errado|tá errado|mentira|falso|nops|de jeito nenhum|nem fudendo)\b/)) {
            return 'discordar';
        }
        
        // SURPRESA
        if (msgLower.match(/\b(nossa|caramba|caralho|pqp|mds|wtf|eita|vish|caraca|olha|olha isso|q isso|que isso|serio|sério)\b/)) {
            return 'surpresa';
        }
        
        // COMEMORAÇÃO
        if (msgLower.match(/\b(aeee|aee|ebaa|eba|boraaaa|bora|isso ai|isso aí|conseguimos|vitoria|vitória|sucesso|foda|demais)\b/)) {
            return 'comemoracao';
        }
        
        // FRUSTRAÇÃO
        if (msgLower.match(/\b(aff|pqp|mds|q merda|que merda|droga|lasquei|zuou|deu ruim|bad|triste|q saco|que saco)\b/)) {
            return 'frustracao';
        }
        
        // ZOAÇÃO
        if (msgLower.match(/\b(kkk|kkkk|kkkkk|haha|rsrs|lol|risos|ala|olha|comédia|zueiro|pagando mico|ridículo|palhaço|engraçado)\b/)) {
            return 'zoacao';
        }
        
        // DEFAULT: CASUAL
        return 'casual';
    }
    
    /**
     * Detectar emoção da mensagem
     */
    static detectarEmocao(msgLower) {
        if (msgLower.match(/\b(feliz|alegre|legal|bom|otimo|ótimo|show|daora|top)\b/) || msgLower.includes('😊') || msgLower.includes('😄')) {
            return 'positiva';
        }
        
        if (msgLower.match(/\b(triste|ruim|bad|péssimo|horrível|merda|bosta|lasquei)\b/) || msgLower.includes('😢') || msgLower.includes('😭')) {
            return 'negativa';
        }
        
        if (msgLower.match(/\b(bravo|puto|nervoso|irritado|pqp|caralho|aff)\b/) || msgLower.includes('😡') || msgLower.includes('😤')) {
            return 'raiva';
        }
        
        if (msgLower.match(/\b(nossa|caramba|eita|vish|wtf|mds)\b/) || msgLower.includes('😱') || msgLower.includes('🤯')) {
            return 'surpresa';
        }
        
        return 'neutra';
    }
    
    /**
     * Detectar intensidade emocional (0.0 - 1.0)
     */
    static detectarIntensidade(msgLower) {
        let intensidade = 0.5; // Base
        
        // Maiúsculas aumentam intensidade
        const upperRatio = (msgLower.match(/[A-Z]/g) || []).length / msgLower.length;
        intensidade += upperRatio * 0.3;
        
        // Exclamações múltiplas
        const exclamacoes = (msgLower.match(/!/g) || []).length;
        intensidade += Math.min(exclamacoes * 0.1, 0.3);
        
        // Palavrões
        if (msgLower.match(/\b(caralho|porra|pqp|merda|fuck|krl)\b/)) {
            intensidade += 0.2;
        }
        
        // Repetições (kkkkk, noooossa)
        if (msgLower.match(/(.)\1{3,}/)) {
            intensidade += 0.15;
        }
        
        return Math.min(intensidade, 1.0);
    }
    
    /**
     * Detectar intenção do usuário
     */
    static detectarIntencao(msgLower) {
        if (msgLower.match(/\b(me fala|me conta|me diz|explica|ensina)\b/)) {
            return 'buscar_informacao';
        }
        
        if (msgLower.match(/\b(ajuda|socorro|help|força|preciso)\b/)) {
            return 'pedir_ajuda';
        }
        
        if (msgLower.match(/\b(concorda|acha|pensa)\b/)) {
            return 'buscar_opiniao';
        }
        
        if (msgLower.match(/\b(brinca|zoando|kkk|piada)\b/)) {
            return 'zoar';
        }
        
        return 'conversar';
    }
    
    /**
     * Extrair palavras-chave importantes
     */
    static extrairPalavrasChave(msgLower) {
        const stopWords = ['o', 'a', 'de', 'da', 'do', 'e', 'é', 'um', 'uma', 'para', 'com', 'sem', 'por'];
        const palavras = msgLower.match(/\b\w+\b/g) || [];
        return palavras.filter(p => p.length > 3 && !stopWords.includes(p));
    }
    
    /**
     * Calcular nível emocional baseado em parâmetros
     */
    static calcularNivelEmocional(parametros, analise) {
        const {
            sarcasmo = 0.5,
            sensibilidade = 0.5,
            paciencia = 0.5,
            humor_negro = 0.5,
            zoeira_geral = 0.5,
            afinidade = 0.5
        } = parametros;
        
        return {
            irritacao: (1 - paciencia) * analise.intensidade,
            deboche: sarcasmo * (analise.emocao === 'raiva' ? 1.3 : 1.0),
            afetuosidade: afinidade * (analise.categoria === 'elogio' ? 1.5 : 1.0),
            frieza: (1 - sensibilidade) * (analise.categoria === 'ofensa' ? 1.2 : 1.0),
            zoeira: zoeira_geral * (analise.categoria === 'zoacao' ? 1.4 : 1.0)
        };
    }
    
    /**
     * ESCOLHER TEMPLATE MEGA AVANÇADO
     */
    static escolherTemplateMegaAvancado(analise, parametros, estilo, nivelEmocional, apelido) {
        const categoria = analise.categoria;
        const {
            afinidade = 0.5,
            sarcasmo = 0.5,
            paciencia = 0.5,
            zoeira_geral = 0.5,
            sensibilidade = 0.5
        } = parametros;
        
        let templates = [];
        
        // === SELEÇÃO MASSIVA DE TEMPLATES ===
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
                
            case 'despedida':
                templates = MENSAGENS_PRONTAS.despedida;
                break;
                
            case 'agradecer':
                templates = MENSAGENS_PRONTAS.receber_agradecimento;
                break;
                
            case 'elogio':
                if (sarcasmo > 0.7 && Math.random() < 0.5) {
                    templates = MENSAGENS_PRONTAS.elogio.receber_elogio_sarcastico;
                } else {
                    templates = MENSAGENS_PRONTAS.elogio.receber_elogio_sincero;
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
                
            case 'provocacao':
                if (zoeira_geral > 0.7) {
                    templates = MENSAGENS_PRONTAS.zoacao;
                } else if (paciencia < 0.4) {
                    templates = MENSAGENS_PRONTAS.ofensa.media;
                } else {
                    templates = MENSAGENS_PRONTAS.ofensa.leve;
                }
                break;
                
            case 'pergunta':
                // Detectar se é pergunta boba
                const perguntasBobas = ['qual seu nome', 'quem é vc', 'quantos anos', '1+1', '2+2'];
                const ehPerguntaBoba = perguntasBobas.some(p => analise.palavrasChave.join(' ').includes(p));
                
                if (sarcasmo > 0.7 && ehPerguntaBoba) {
                    templates = MENSAGENS_PRONTAS.pergunta.pergunta_boba;
                } else {
                    templates = MENSAGENS_PRONTAS.pergunta.responder_normal;
                }
                break;
                
            case 'ajuda':
                if (afinidade > 0.6) {
                    templates = MENSAGENS_PRONTAS.ajuda.aceitar;
                } else if (paciencia < 0.4) {
                    templates = MENSAGENS_PRONTAS.ajuda.recusar;
                } else {
                    templates = MENSAGENS_PRONTAS.ajuda.aceitar;
                }
                break;
                
            case 'confusao':
                templates = MENSAGENS_PRONTAS.confusao;
                break;
                
            case 'concordar':
                templates = MENSAGENS_PRONTAS.concordar;
                break;
                
            case 'discordar':
                templates = MENSAGENS_PRONTAS.discordar;
                break;
                
            case 'surpresa':
                if (analise.emocao === 'positiva') {
                    templates = MENSAGENS_PRONTAS.surpresa.positiva;
                } else if (analise.emocao === 'negativa') {
                    templates = MENSAGENS_PRONTAS.surpresa.negativa;
                } else {
                    templates = MENSAGENS_PRONTAS.surpresa.neutra;
                }
                break;
                
            case 'comemoracao':
                templates = MENSAGENS_PRONTAS.comemoracao;
                break;
                
            case 'frustracao':
                templates = MENSAGENS_PRONTAS.frustracao;
                break;
                
            case 'zoacao':
                templates = MENSAGENS_PRONTAS.zoacao;
                break;
                
            case 'casual':
            default:
                templates = MENSAGENS_PRONTAS.casual;
                break;
        }
        
        // Escolher template aleatório
        if (templates && templates.length > 0) {
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        // FALLBACK FINAL
        return MENSAGENS_PRONTAS.fallback[Math.floor(Math.random() * MENSAGENS_PRONTAS.fallback.length)];
    }
    
    /**
     * Calcular intensidade de transformação mandrake
     */
    static calcularIntensidadeMandrake(parametros, analise) {
        const {
            espontaneidade = 0.5,
            zoeira_geral = 0.5,
            criatividade = 0.5
        } = parametros;
        
        // Base: média dos parâmetros relevantes
        let intensidade = (espontaneidade + zoeira_geral + criatividade) / 3;
        
        // Aumentar em zoações
        if (analise.categoria === 'zoacao') {
            intensidade += 0.2;
        }
        
        // Reduzir em contextos sérios
        if (analise.categoria === 'ajuda' || analise.categoria === 'pergunta') {
            intensidade -= 0.15;
        }
        
        return Math.max(0.3, Math.min(intensidade, 0.9));
    }
}

module.exports = ResponseBuilder;
