const UserNicknames = require('./UserNicknames');

// Elementos linguísticos por estilo de resposta
const ELEMENTOS_LINGUISTICOS = {
    carinhoso: {
        prefixos: ['Ei', 'Opa', 'Fala', 'Oi', 'E aí'],
        sufixos: ['❤️', '🥰', '💕', '😊', '✨'],
        apelidos: ['amor', 'querido(a)', 'fofo(a)', 'lindinho(a)'],
        intensificadores: ['super', 'muito', 'demais', 'pra caramba']
    },
    
    amigavel: {
        prefixos: ['Fala', 'E aí', 'Opa', 'Beleza', 'Salve'],
        sufixos: ['😄', '👍', '✌️', '😊', '🙌'],
        apelidos: ['mano', 'parça', 'brother', 'amigo(a)'],
        intensificadores: ['bem', 'bastante', 'muito']
    },
    
    neutro: {
        prefixos: ['Então', 'Olha', 'Bem', 'Ok', 'Entendi'],
        sufixos: ['👍', '✌️', '🤔', '💭'],
        apelidos: [],
        intensificadores: ['meio', 'um pouco', 'razoavelmente']
    },
    
    frio: {
        prefixos: ['Olha', 'Veja', 'Certo', 'Ok'],
        sufixos: ['...', '😐', '🤨'],
        apelidos: [],
        intensificadores: ['mal', 'quase não', 'pouco']
    },
    
    hostil: {
        prefixos: ['Olha só', 'Ué', 'Sério?', 'Nossa'],
        sufixos: ['🙄', '😒', '...', '😤'],
        apelidos: [],
        intensificadores: ['nem', 'nada', 'zero']
    },
    
    provocador: {
        prefixos: ['Ahh', 'Claro', 'Sei', 'Ahan', 'Uau'],
        sufixos: ['né 😏', '🤭', '😈', '🙃', '👀'],
        ironias: ['genial', 'brilhante', 'perfeito', 'ótimo', 'maravilhoso'],
        sarcasmos: ['com certeza', 'obviamente', 'claramente', 'sem dúvida']
    }
};

// Templates de resposta por categoria
const TEMPLATES = {
    saudacao: [
        { condicao: (p) => p.afinidade > 0.7, template: 'E aí {apelido}! Como vai? {emoji}' },
        { condicao: (p) => p.afinidade > 0.5, template: 'Fala {username}! Tudo certo? {emoji}' },
        { condicao: (p) => p.afinidade < 0.3, template: 'Oi {username}. {emoji}' },
        { condicao: (p) => p.sarcasmo > 0.7, template: '{prefixo}, {username}... {emoji}' },
        { condicao: () => true, template: 'Fala {username}! {emoji}' }
    ],
    
    pergunta: [
        { condicao: (p) => p.sarcasmo > 0.7, template: 'Sério que você tá perguntando isso? {ironia} {emoji}' },
        { condicao: (p) => p.afinidade > 0.7, template: 'Boa pergunta, {apelido}! Deixa eu pensar... {emoji}' },
        { condicao: (p) => p.curiosidade > 0.6, template: 'Interessante essa pergunta! {emoji}' },
        { condicao: () => true, template: 'Boa pergunta! {emoji}' }
    ],
    
    provocacao: [
        { condicao: (p) => p.afinidade > 0.6, template: 'Ahh {username}, me provocando de novo? {emoji}' },
        { condicao: (p) => p.sarcasmo > 0.7, template: '{prefixo}... {ironia}, viu? {emoji}' },
        { condicao: (p) => p.paciencia < 0.3, template: 'De novo isso? {emoji}' },
        { condicao: () => true, template: '{prefixo} {username}... {emoji}' }
    ],
    
    elogio: [
        { condicao: (p) => p.afinidade > 0.7, template: 'Obrigado, {apelido}! Você também é demais! {emoji}' },
        { condicao: (p) => p.sarcasmo > 0.7, template: '{prefixo}... tá me bajulando agora? {emoji}' },
        { condicao: (p) => p.autoestima > 0.6, template: 'Eu sei que sou incrível! Mas obrigado! {emoji}' },
        { condicao: () => true, template: 'Valeu, {username}! {emoji}' }
    ],
    
    casual: [
        { condicao: (p) => p.afinidade > 0.7, template: '{prefixo} {apelido}, {resposta} {emoji}' },
        { condicao: (p) => p.sarcasmo > 0.7, template: '{prefixo}... {resposta} {emoji}' },
        { condicao: (p) => p.zoeira_geral > 0.7, template: '{resposta} kkkk {emoji}' },
        { condicao: () => true, template: '{resposta} {emoji}' }
    ],
    
    fallback: [
        { condicao: (p) => p.afinidade > 0.7, template: 'Entendi, {apelido}! {emoji}' },
        { condicao: (p) => p.sarcasmo > 0.7, template: 'Ahh tá... {emoji}' },
        { condicao: () => true, template: 'Interessante... {emoji}' }
    ]
};

class ResponseBuilder {
    /**
     * Construir resposta personalizada completa
     */
    static construirResposta(mensagemBase, parametrosFinais, estiloResposta, username, categoria = 'casual', userId = null) {
        const elementos = ELEMENTOS_LINGUISTICOS[estiloResposta.tom] || ELEMENTOS_LINGUISTICOS.neutro;
        
        // Escolher template baseado na categoria
        const template = this.escolherTemplate(categoria, parametrosFinais);
        
        // Obter apelido do usuário (usa sistema de nicknames se userId fornecido)
        const apelidoFinal = userId 
            ? UserNicknames.getNickname(userId)
            : this.escolherApelido(username, parametrosFinais.afinidade, elementos);
        
        // Preparar variáveis para substituição
        const vars = {
            username: apelidoFinal, // Usar apelido como username
            apelido: apelidoFinal,  // Apelido também usa o sistema
            prefixo: this.escolherPrefixo(elementos, parametrosFinais.espontaneidade),
            emoji: this.escolherEmoji(elementos, parametrosFinais.extroversao),
            ironia: this.escolherIronia(elementos, parametrosFinais.sarcasmo),
            resposta: mensagemBase
        };
        
        // Substituir variáveis no template
        let resposta = template;
        for (const [key, value] of Object.entries(vars)) {
            resposta = resposta.replace(`{${key}}`, value);
        }
        
        // Aplicar sarcasmo adicional se nível alto
        if (parametrosFinais.sarcasmo > 0.75 && Math.random() < 0.3) {
            resposta = this.adicionarSarcasmo(resposta, elementos);
        }
        
        return resposta.trim();
    }
    
    /**
     * Escolher template mais adequado baseado em condições
     */
    static escolherTemplate(categoria, parametros) {
        const templatesCategoria = TEMPLATES[categoria] || TEMPLATES.casual;
        
        for (const t of templatesCategoria) {
            if (t.condicao(parametros)) {
                return t.template;
            }
        }
        
        return templatesCategoria[templatesCategoria.length - 1].template;
    }
    
    /**
     * Escolher apelido baseado na afinidade
     */
    static escolherApelido(username, afinidade, elementos) {
        if (afinidade < 0.6 || !elementos.apelidos || elementos.apelidos.length === 0) {
            return username;
        }
        
        // Chance de usar apelido proporcional à afinidade
        if (Math.random() < (afinidade - 0.3)) {
            return elementos.apelidos[Math.floor(Math.random() * elementos.apelidos.length)];
        }
        
        return username;
    }
    
    /**
     * Escolher prefixo baseado na espontaneidade
     */
    static escolherPrefixo(elementos, espontaneidade) {
        if (!elementos.prefixos || Math.random() > espontaneidade) {
            return '';
        }
        
        return elementos.prefixos[Math.floor(Math.random() * elementos.prefixos.length)];
    }
    
    /**
     * Escolher emoji baseado na extroversão
     */
    static escolherEmoji(elementos, extroversao) {
        if (!elementos.sufixos || Math.random() > extroversao) {
            return '';
        }
        
        return elementos.sufixos[Math.floor(Math.random() * elementos.sufixos.length)];
    }
    
    /**
     * Escolher ironia para sarcasmo
     */
    static escolherIronia(elementos, sarcasmo) {
        if (!elementos.ironias || sarcasmo < 0.5) {
            return '';
        }
        
        return elementos.ironias[Math.floor(Math.random() * elementos.ironias.length)];
    }
    
    /**
     * Adicionar camada extra de sarcasmo
     */
    static adicionarSarcasmo(resposta, elementos) {
        if (!elementos.sarcasmos) {
            return resposta;
        }
        
        const sarcasmo = elementos.sarcasmos[Math.floor(Math.random() * elementos.sarcasmos.length)];
        
        // Adicionar no início ou final da frase
        if (Math.random() < 0.5) {
            return `${sarcasmo}, ${resposta.toLowerCase()}`;
        } else {
            return `${resposta}, ${sarcasmo}`;
        }
    }
    
    /**
     * Categorizar mensagem automaticamente
     */
    static categorizarMensagem(mensagem) {
        const msgLower = mensagem.toLowerCase();
        
        // Saudação
        if (msgLower.match(/\b(oi|olá|ola|e aí|eai|salve|fala|hey|hello)\b/)) {
            return 'saudacao';
        }
        
        // Pergunta
        if (msgLower.includes('?') || msgLower.match(/\b(como|quando|onde|por que|porque|qual|quem|o que)\b/)) {
            return 'pergunta';
        }
        
        // Elogio
        if (msgLower.match(/\b(obrigad|valeu|legal|legal|massa|top|incrível|foda|demais|show)\b/)) {
            return 'elogio';
        }
        
        // Provocação (keywords negativas ou desafiadoras)
        if (msgLower.match(/\b(burro|idiota|ruim|lixo|horrível|péssimo|desafio|aposto)\b/)) {
            return 'provocacao';
        }
        
        // Default: casual
        return 'casual';
    }
    
    /**
     * Gerar resposta usando template (sistema sem IA)
     */
    static gerarRespostaTemplate(mensagem, parametrosFinais, estiloResposta, username, userId = null) {
        const categoria = this.categorizarMensagem(mensagem);
        
        // Mensagens base simples por categoria
        const mensagensBase = {
            saudacao: '',
            pergunta: '',
            provocacao: '',
            elogio: '',
            casual: 'interessante isso',
            fallback: ''
        };
        
        const mensagemBase = mensagensBase[categoria] || '';
        
        return this.construirResposta(mensagemBase, parametrosFinais, estiloResposta, username, categoria, userId);
    }
}

module.exports = ResponseBuilder;

