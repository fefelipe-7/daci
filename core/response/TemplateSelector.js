/**
 * TemplateSelector - Seleção inteligente de templates
 * 
 * Escolhe o template perfeito baseado em contexto, personalidade e emoção
 */

class TemplateSelector {
    constructor(mensagensProntas) {
        this.templates = mensagensProntas;
    }

    /**
     * Escolher template mega avançado
     */
    escolherTemplate(analise, parametros, estilo, nivelEmocional, apelido) {
        const categoria = analise.categoria;
        const {
            afinidade = 0.5,
            sarcasmo = 0.5,
            paciencia = 0.5
        } = parametros;
        
        let templates = [];
        
        switch(categoria) {
            case 'saudacao':
                if (afinidade > 0.7) templates = this.templates.saudacao.alta_afinidade;
                else if (afinidade > 0.4) templates = this.templates.saudacao.media_afinidade;
                else if (afinidade < 0.3) templates = this.templates.saudacao.baixa_afinidade;
                else templates = this.templates.saudacao.neutro;
                break;
                
            case 'despedida':
                templates = this.templates.despedida;
                break;
                
            case 'agradecer':
                templates = this.templates.receber_agradecimento;
                break;
                
            case 'elogio':
                if (sarcasmo > 0.7 && Math.random() < 0.5) templates = this.templates.elogio.receber_elogio_sarcastico;
                else templates = this.templates.elogio.receber_elogio_sincero;
                break;
                
            case 'ofensa':
                if (paciencia > 0.5) templates = this.templates.ofensa.leve;
                else if (paciencia > 0.3) templates = this.templates.ofensa.media;
                else templates = this.templates.ofensa.pesada;
                break;
                
            case 'pergunta':
                if (sarcasmo > 0.7 && Math.random() < 0.3) templates = this.templates.pergunta.pergunta_boba;
                else templates = this.templates.pergunta.responder_normal;
                break;
                
            case 'ajuda':
                templates = this.templates.ajuda.aceitar;
                break;
                
            case 'confusao':
                templates = this.templates.confusao;
                break;
                
            case 'concordar':
                templates = this.templates.concordar;
                break;
                
            case 'discordar':
                templates = this.templates.discordar;
                break;
                
            case 'surpresa':
                if (analise.emocao === 'positiva') templates = this.templates.surpresa.positiva;
                else if (analise.emocao === 'negativa') templates = this.templates.surpresa.negativa;
                else templates = this.templates.surpresa.neutra;
                break;
                
            case 'comemoracao':
                templates = this.templates.comemoracao;
                break;
                
            case 'frustracao':
                templates = this.templates.frustracao;
                break;
                
            case 'zoacao':
                templates = this.templates.zoacao;
                break;
                
            case 'casual':
            default:
                templates = this.templates.casual;
                break;
        }
        
        // Fallback se não houver templates
        if (!templates || templates.length === 0) {
            templates = this.templates.fallback || ['blz fi'];
        }
        
        // Escolher aleatoriamente
        return templates[Math.floor(Math.random() * templates.length)];
    }
}

module.exports = TemplateSelector;

