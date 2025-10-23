const UserPersonality = require('../models/UserPersonality');

// Pesos contextuais: quanto cada parâmetro é influenciado pelo bot vs usuário
// Peso > 0.5 = Bot domina | Peso < 0.5 = Usuário influencia mais
const CONTEXT_WEIGHTS = {
    sarcasmo: 0.7,          // Bot é naturalmente sarcástico
    criatividade: 0.6,      // Bot tem estilo próprio
    humor_negro: 0.7,       // Parte do DNA do bot
    zoeira_geral: 0.7,      // Bot é zoeiro por natureza
    extroversao: 0.6,       // Bot tende a ser extrovertido
    
    sensibilidade: 0.8,     // Bot respeita limites do usuário
    afinidade: 0.9,         // Relação construída pelo usuário
    paciencia: 0.7,         // Bot reage ao comportamento do usuário
    empatia: 0.6,           // Bot se adapta ao usuário
    
    // Balanceados (influência mútua)
    lideranca: 0.5,
    espontaneidade: 0.5,
    lealdade: 0.5,
    dominancia: 0.5,
    autoestima: 0.5,
    curiosidade: 0.5
};

// Influências cruzadas entre parâmetros
// Quando um parâmetro é alto, afeta outros
const PARAMETRO_INFLUENCIAS = {
    sensibilidade: {
        humor_negro: -0.3,  // Alta sensibilidade reduz humor negro
        sarcasmo: -0.2,     // E reduz sarcasmo
        empatia: 0.2        // Mas aumenta empatia
    },
    
    afinidade: {
        lealdade: 0.3,      // Alta afinidade aumenta lealdade
        paciencia: 0.2,     // E paciência
        empatia: 0.25,      // E empatia
        sarcasmo: -0.15,    // Mas reduz sarcasmo
        humor_negro: -0.1   // E humor pesado
    },
    
    lideranca: {
        dominancia: 0.3,    // Líderes tendem a dominar
        autoestima: 0.2,    // Têm alta autoestima
        paciencia: -0.1     // Mas menos paciência com desafios
    },
    
    zoeira_geral: {
        espontaneidade: 0.2,  // Zoeira aumenta espontaneidade
        sarcasmo: 0.15,       // E sarcasmo
        sensibilidade: -0.1   // Mas reduz sensibilidade
    },
    
    humor_negro: {
        sarcasmo: 0.15,       // Humor negro combina com sarcasmo
        sensibilidade: -0.2   // Mas conflita com sensibilidade
    },
    
    empatia: {
        paciencia: 0.2,       // Empatia aumenta paciência
        afinidade: 0.15,      // E afinidade
        dominancia: -0.1      // Mas reduz dominância
    }
};

class PersonalityEngine {
    /**
     * Calcular personalidade composta (bot + usuário)
     */
    static calcularPersonalidadeComposta(perfilUser) {
        const baseBot = UserPersonality.getBasePersonality();
        const parametros = {};
        const parametrosValidos = UserPersonality.getValidParameters();
        
        // Fusão ponderada de cada parâmetro
        for (const param of parametrosValidos) {
            const pesoBot = CONTEXT_WEIGHTS[param] || 0.5;
            const pesoUser = 1 - pesoBot;
            
            const valorBot = baseBot[param] || 0.5;
            const valorUser = perfilUser[param] || 0.5;
            
            parametros[param] = (valorBot * pesoBot) + (valorUser * pesoUser);
        }
        
        return parametros;
    }
    
    /**
     * Aplicar influências cruzadas entre parâmetros
     */
    static aplicarInfluenciasCruzadas(parametros) {
        const ajustados = { ...parametros };
        
        for (const [param, valor] of Object.entries(parametros)) {
            if (PARAMETRO_INFLUENCIAS[param]) {
                for (const [alvo, influencia] of Object.entries(PARAMETRO_INFLUENCIAS[param])) {
                    // Influência proporcional ao valor do parâmetro fonte
                    ajustados[alvo] = (ajustados[alvo] || 0.5) + (valor * influencia);
                    
                    // Clamp entre 0 e 1
                    ajustados[alvo] = Math.max(0, Math.min(1, ajustados[alvo]));
                }
            }
        }
        
        return ajustados;
    }
    
    /**
     * Determinar tipo de relação baseado nos parâmetros finais
     */
    static determinarTipoRelacao(parametrosFinais) {
        const { afinidade, sarcasmo, humor_negro, empatia, lealdade, sensibilidade } = parametrosFinais;
        
        // Calcular scores compostos
        const scoreAfetividade = (afinidade * 0.5) + (empatia * 0.3) + (lealdade * 0.2);
        const scoreProvocacao = (sarcasmo * 0.4) + (humor_negro * 0.4) + (1 - sensibilidade) * 0.2;
        
        // Classificar relação
        if (scoreAfetividade > 0.7) {
            return scoreProvocacao > 0.6 ? 'rival_amigavel' : 'protetor';
        } else if (scoreAfetividade > 0.5) {
            return scoreProvocacao > 0.6 ? 'amigavel_provocador' : 'amigavel';
        } else if (scoreAfetividade < 0.3) {
            return scoreProvocacao > 0.6 ? 'rival' : 'distante';
        } else {
            return 'neutro';
        }
    }
    
    /**
     * Calcular estilo de resposta baseado nos parâmetros
     */
    static calcularEstiloResposta(parametrosFinais) {
        const { 
            afinidade, empatia, sarcasmo, humor_negro, 
            zoeira_geral, extroversao, espontaneidade, sensibilidade 
        } = parametrosFinais;
        
        // Tom emocional
        const afetividade = (afinidade * 0.6) + (empatia * 0.4);
        let tom;
        if (afetividade > 0.7) tom = 'carinhoso';
        else if (afetividade > 0.5) tom = 'amigavel';
        else if (afetividade > 0.3) tom = 'neutro';
        else if (afetividade > 0.1) tom = 'frio';
        else tom = 'hostil';
        
        // Nível de provocação
        const provocacao = (sarcasmo * 0.4) + (humor_negro * 0.3) + (zoeira_geral * 0.3);
        let nivelProvocacao;
        if (provocacao > 0.7) nivelProvocacao = 'alto';
        else if (provocacao > 0.4) nivelProvocacao = 'moderado';
        else nivelProvocacao = 'baixo';
        
        // Formalidade (inverso de informalidade)
        const informalidade = (extroversao * 0.5) + (espontaneidade * 0.5);
        const formalidade = 1 - informalidade;
        
        return {
            tom,
            provocacao: nivelProvocacao,
            formalidade,
            extroversao,
            espontaneidade,
            sarcasmo,
            sensibilidade
        };
    }
    
    /**
     * Processar perfil completo: fusão + influências + análise
     */
    static processarPerfil(perfilUser) {
        // 1. Calcular personalidade composta
        let parametros = this.calcularPersonalidadeComposta(perfilUser);
        
        // 2. Aplicar influências cruzadas
        parametros = this.aplicarInfluenciasCruzadas(parametros);
        
        // 3. Determinar tipo de relação
        const tipoRelacao = this.determinarTipoRelacao(parametros);
        
        // 4. Calcular estilo de resposta
        const estiloResposta = this.calcularEstiloResposta(parametros);
        
        return {
            parametrosFinais: parametros,
            tipoRelacao,
            estiloResposta
        };
    }
    
    /**
     * Gerar debug info para análise
     */
    static gerarDebugInfo(perfilUser, username) {
        const baseBot = UserPersonality.getBasePersonality();
        
        // Calcular sem influências
        const compostoSemInfluencias = this.calcularPersonalidadeComposta(perfilUser);
        
        // Calcular com influências
        const compostoComInfluencias = this.aplicarInfluenciasCruzadas(compostoSemInfluencias);
        
        // Determinar estilo
        const tipoRelacao = this.determinarTipoRelacao(compostoComInfluencias);
        const estiloResposta = this.calcularEstiloResposta(compostoComInfluencias);
        
        // Identificar influências aplicadas
        const influencias = [];
        for (const param of Object.keys(compostoComInfluencias)) {
            const diff = compostoComInfluencias[param] - compostoSemInfluencias[param];
            if (Math.abs(diff) > 0.01) {
                influencias.push(`${param} ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
            }
        }
        
        return {
            username,
            baseBot: {
                sarcasmo: baseBot.sarcasmo.toFixed(2),
                afinidade: baseBot.afinidade.toFixed(2),
                humor_negro: baseBot.humor_negro.toFixed(2)
            },
            perfilUser: {
                sarcasmo: perfilUser.sarcasmo.toFixed(2),
                afinidade: perfilUser.afinidade.toFixed(2),
                humor_negro: perfilUser.humor_negro.toFixed(2)
            },
            fusao: {
                sarcasmo: compostoSemInfluencias.sarcasmo.toFixed(2),
                afinidade: compostoSemInfluencias.afinidade.toFixed(2),
                humor_negro: compostoSemInfluencias.humor_negro.toFixed(2)
            },
            influencias: influencias.join(', ') || 'nenhuma',
            tipoRelacao,
            estiloResposta: {
                tom: estiloResposta.tom,
                provocacao: estiloResposta.provocacao,
                sarcasmo: estiloResposta.sarcasmo.toFixed(2)
            }
        };
    }
}

module.exports = PersonalityEngine;

