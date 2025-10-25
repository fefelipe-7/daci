/**
 * ContextAnalyzer - Análise profunda de contexto
 * 
 * Detecta categoria, emoção, intensidade, intenção e palavras-chave
 */

class ContextAnalyzer {
    /**
     * Análise completa do contexto da mensagem
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
     * Detectar categoria principal
     */
    static detectarCategoria(msgLower) {
        if (msgLower.match(/\b(oi|olá|ola|e aí|eai|e ai|salve|fala|hey|hello|blz|suave|daora|tmj|opa|bom dia|boa tarde|boa noite)\b/)) return 'saudacao';
        if (msgLower.match(/\b(tchau|flw|vlw|até|falou|até mais|até logo|fuiiiii|vou nessa|to indo|tamo junto|tmj)\b/)) return 'despedida';
        if (msgLower.match(/\b(obrigad|valeu|vlw|tmj|agradeço|agradeco|thanks|obg|brigadão|brigadao)\b/)) return 'agradecer';
        if (msgLower.match(/\b(legal|massa|top|incrível|foda|demais|show|chave|brabo|sucesso|parabens|parabéns|maneiro|daora|pika|foda|mt bom|bom demais)\b/)) return 'elogio';
        if (msgLower.match(/\b(burro|idiota|ruim|lixo|horrível|péssimo|merda|bosta|cuzao|cuzão|fdp|vai se fude|vsf|otario|otário|escroto|filho da puta|vai tomar no cu)\b/)) return 'ofensa';
        if (msgLower.match(/\b(desafio|aposto|ta errado|tá errado|vacilou|pagou mico|se acha|viaja|brisa|doido|loko|maluco|pirou|surtou)\b/)) return 'provocacao';
        if (msgLower.includes('?') || msgLower.match(/\b(como|quando|onde|por que|pq|porque|qual|quem|o que|oq|cadê|cade|me explica|me fala|conta)\b/)) return 'pergunta';
        if (msgLower.match(/\b(me ajuda|ajuda|preciso|socorro|help|me salva|da uma força|força ai|bora me ajudar)\b/)) return 'ajuda';
        if (msgLower.match(/\b(hã|oi\?|como assim|n entendi|nao entendi|não entendi|repete|fala dnv|explica|wtf|q isso|que isso)\b/)) return 'confusao';
        if (msgLower.match(/\b(sim|exato|isso ai|isso aí|verdade|concordo|real|certinho|tmj|é isso|facts|certeza|com ctz)\b/)) return 'concordar';
        if (msgLower.match(/\b(não|nao|nem|nada a ver|discordo|ta errado|tá errado|mentira|falso|nops|de jeito nenhum|nem fudendo)\b/)) return 'discordar';
        if (msgLower.match(/\b(nossa|caramba|caralho|pqp|mds|wtf|eita|vish|caraca|olha|olha isso|q isso|que isso|serio|sério)\b/)) return 'surpresa';
        if (msgLower.match(/\b(aeee|aee|ebaa|eba|boraaaa|bora|isso ai|isso aí|conseguimos|vitoria|vitória|sucesso|foda|demais)\b/)) return 'comemoracao';
        if (msgLower.match(/\b(aff|pqp|mds|q merda|que merda|droga|lasquei|zuou|deu ruim|bad|triste|q saco|que saco)\b/)) return 'frustracao';
        if (msgLower.match(/\b(kkk|kkkk|kkkkk|haha|rsrs|lol|risos|ala|olha|comédia|zueiro|pagando mico|ridículo|palhaço|engraçado)\b/)) return 'zoacao';
        
        return 'casual';
    }
    
    /**
     * Detectar emoção
     */
    static detectarEmocao(msgLower) {
        if (msgLower.match(/\b(feliz|alegre|legal|bom|otimo|ótimo|show|daora|top)\b/) || msgLower.includes('😊') || msgLower.includes('😄')) return 'positiva';
        if (msgLower.match(/\b(triste|ruim|bad|péssimo|horrível|merda|bosta|lasquei)\b/) || msgLower.includes('😢') || msgLower.includes('😭')) return 'negativa';
        if (msgLower.match(/\b(bravo|puto|nervoso|irritado|pqp|caralho|aff)\b/) || msgLower.includes('😡') || msgLower.includes('😤')) return 'raiva';
        if (msgLower.match(/\b(nossa|caramba|eita|vish|wtf|mds)\b/) || msgLower.includes('😱') || msgLower.includes('🤯')) return 'surpresa';
        
        return 'neutra';
    }
    
    /**
     * Detectar intensidade emocional (0.0 - 1.0)
     */
    static detectarIntensidade(msgLower) {
        let intensidade = 0.5;
        
        const upperRatio = (msgLower.match(/[A-Z]/g) || []).length / msgLower.length;
        intensidade += upperRatio * 0.3;
        
        const exclamacoes = (msgLower.match(/!/g) || []).length;
        intensidade += Math.min(exclamacoes * 0.1, 0.3);
        
        if (msgLower.match(/\b(caralho|porra|pqp|merda|fuck|krl)\b/)) intensidade += 0.2;
        if (msgLower.match(/(.)\1{3,}/)) intensidade += 0.15;
        
        return Math.min(intensidade, 1.0);
    }
    
    /**
     * Detectar intenção do usuário
     */
    static detectarIntencao(msgLower) {
        if (msgLower.match(/\b(me fala|me conta|me diz|explica|ensina)\b/)) return 'buscar_informacao';
        if (msgLower.match(/\b(ajuda|socorro|help|força|preciso)\b/)) return 'pedir_ajuda';
        if (msgLower.match(/\b(concorda|acha|pensa)\b/)) return 'buscar_opiniao';
        if (msgLower.match(/\b(brinca|zoando|kkk|piada)\b/)) return 'zoar';
        
        return 'conversar';
    }
    
    /**
     * Extrair palavras-chave
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
}

module.exports = ContextAnalyzer;

