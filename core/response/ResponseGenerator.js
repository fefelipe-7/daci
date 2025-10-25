/**
 * ResponseGenerator - Geração final da resposta
 * 
 * Aplica transformações, formatação e estilo mandrake
 */

const LanguageTransformer = require('../LanguageTransformer');

class ResponseGenerator {
    /**
     * Gerar resposta final com transformações
     */
    generate(template, context, apelido, analise, parametros, estilo) {
        // 1. Substituir variáveis no template
        const resposta = LanguageTransformer.formatarTemplate(template, {
            username: apelido,
            apelido: apelido
        });
        
        // 2. Calcular intensidade mandrake
        const intensidadeMandrake = this.calcularIntensidadeMandrake(parametros, analise);
        
        // 3. Aplicar transformação mandrake
        const respostaFinal = LanguageTransformer.toMandrake(resposta, intensidadeMandrake, {
            tom: estilo.tom,
            provocacao: estilo.provocacao,
            contexto: analise.categoria
        });
        
        return respostaFinal;
    }
    
    /**
     * Calcular intensidade da transformação mandrake
     */
    calcularIntensidadeMandrake(parametros, analise) {
        const {
            espontaneidade = 0.5,
            zoeira_geral = 0.5,
            criatividade = 0.5
        } = parametros;
        
        let intensidade = (espontaneidade + zoeira_geral + criatividade) / 3;
        
        // Ajustar baseado no contexto
        if (analise.categoria === 'casual' || analise.categoria === 'zoacao') {
            intensidade *= 1.2;
        }
        
        if (analise.categoria === 'ofensa' || analise.categoria === 'frustração') {
            intensidade *= 0.8; // Ser mais direto
        }
        
        return Math.min(intensidade, 1.0);
    }
}

module.exports = ResponseGenerator;

