/**
 * Transformador de Linguagem - Estilo Mandrake Jovem 17
 * 
 * Converte texto normal para linguagem mandrake autêntica
 * Aplica abreviações, alongamentos, emojis e naturalidade
 */

const { ABREVIACOES, EMOJIS, ALONGAMENTOS, RISADAS } = require('./personality/DaciPersonality'); // Refatorado

class LanguageTransformer {
    
    /**
     * Transforma texto completo para estilo mandrake
     * @param {string} texto - Texto original
     * @param {number} intensidade - Nível de transformação (0.0 a 1.0)
     * @param {object} contexto - Contexto emocional (tom, provocacao, etc)
     * @returns {string} Texto transformado
     */
    static toMandrake(texto, intensidade = 0.8, contexto = {}) {
        if (!texto || texto.trim() === '') return texto;
        
        let resultado = texto;
        
        // 1. Tudo minúsculo (característica mandrake)
        resultado = resultado.toLowerCase();
        
        // 2. Aplicar abreviações
        resultado = this.aplicarAbreviacoes(resultado, intensidade);
        
        // 3. Remover pontuação formal desnecessária
        resultado = this.limparPontuacao(resultado);
        
        // 4. Alongar vogais para ênfase
        if (Math.random() < intensidade * 0.5) {
            resultado = this.alongarVogais(resultado);
        }
        
        // 5. Adicionar risada ocasionalmente
        if (Math.random() < intensidade * 0.4 && !resultado.includes('kkk')) {
            resultado = this.adicionarRisada(resultado);
        }
        
        // 6. Adicionar emoji baseado no contexto
        // Verificar se já tem emoji (usando unicode range genérico)
        if (!/[\u{1F300}-\u{1F9FF}]/u.test(resultado)) { // Se já não tem emoji
            resultado = this.adicionarEmoji(resultado, contexto);
        }
        
        // 7. Aplicar erros de digitação ocasionais (muito leve)
        if (Math.random() < intensidade * 0.15) {
            resultado = this.aplicarErrosDigitacao(resultado);
        }
        
        return resultado.trim();
    }
    
    /**
     * Aplica abreviações mandrake
     */
    static aplicarAbreviacoes(texto, intensidade) {
        let resultado = texto;
        
        // Ordenar por tamanho (maiores primeiro para evitar conflitos)
        const abrevOrdenadas = Object.entries(ABREVIACOES)
            .sort((a, b) => b[0].length - a[0].length);
        
        for (const [palavra, abrev] of abrevOrdenadas) {
            // Aplicar com base na intensidade
            if (Math.random() < intensidade) {
                const regex = new RegExp(`\\b${palavra}\\b`, 'gi');
                resultado = resultado.replace(regex, abrev);
            }
        }
        
        return resultado;
    }
    
    /**
     * Limpa pontuação formal
     */
    static limparPontuacao(texto) {
        // Remove pontos finais (exceto reticências)
        let resultado = texto.replace(/\.(?!\.)/g, '');
        
        // Remove vírgulas em excesso
        resultado = resultado.replace(/,\s*,+/g, ',');
        
        // Mantém ! e ? mas não duplicados demais
        resultado = resultado.replace(/!{3,}/g, '!!');
        resultado = resultado.replace(/\?{3,}/g, '??');
        
        return resultado;
    }
    
    /**
     * Alonga vogais para ênfase
     */
    static alongarVogais(texto) {
        for (const [palavra, alongada] of Object.entries(ALONGAMENTOS)) {
            if (texto.includes(palavra)) {
                texto = texto.replace(palavra, alongada);
                break; // Só alonga uma palavra por vez
            }
        }
        
        return texto;
    }
    
    /**
     * Adiciona risada (kkk)
     */
    static adicionarRisada(texto) {
        const risada = RISADAS[Math.floor(Math.random() * RISADAS.length)];
        
        // Adicionar no final com probabilidades diferentes
        if (Math.random() < 0.7) {
            return `${texto} ${risada}`;
        } else {
            return `${risada} ${texto}`;
        }
    }
    
    /**
     * Adiciona emoji baseado no contexto
     */
    static adicionarEmoji(texto, contexto = {}) {
        let categoria = 'deboche'; // Padrão
        
        // Determinar categoria baseada no contexto
        if (contexto.tom === 'hostil' || contexto.tom === 'frio') {
            categoria = Math.random() < 0.5 ? 'raiva' : 'deboche';
        } else if (contexto.tom === 'carinhoso') {
            categoria = 'aprovacao';
        } else if (contexto.provocacao === 'alto') {
            categoria = 'deboche';
        } else if (contexto.tom === 'amigavel') {
            categoria = Math.random() < 0.5 ? 'aprovacao' : 'confianca';
        }
        
        // Se o texto indica emoção específica, usar categoria apropriada
        if (texto.match(/nossa|caralho|mds|vish/i)) {
            categoria = 'surpresa';
        } else if (texto.match(/top|brabo|chave|sucesso/i)) {
            categoria = 'confianca';
        } else if (texto.match(/sei|claro|obvio|certeza/i)) {
            categoria = 'deboche';
        }
        
        const emoji = this.escolherEmoji(categoria);
        
        // Adicionar emoji no final (80% das vezes) ou no meio (20%)
        if (Math.random() < 0.8 || texto.length < 15) {
            return `${texto} ${emoji}`;
        } else {
            // Inserir emoji no meio (após primeira frase/vírgula)
            const posicao = texto.search(/[,!?]/);
            if (posicao > 0) {
                return texto.slice(0, posicao + 1) + ` ${emoji}` + texto.slice(posicao + 1);
            }
            return `${texto} ${emoji}`;
        }
    }
    
    /**
     * Escolhe emoji de uma categoria
     */
    static escolherEmoji(categoria = 'deboche') {
        const lista = EMOJIS[categoria] || EMOJIS.deboche;
        return lista[Math.floor(Math.random() * lista.length)];
    }
    
    /**
     * Aplica erros de digitação ocasionais (muito leve e realista)
     */
    static aplicarErrosDigitacao(texto) {
        // Erros comuns e realistas
        const erros = [
            { de: 'ção', para: 'cao' },
            { de: 'ss', para: 's' },
            { de: 'rr', para: 'r' },
            { de: 'mente', para: 'menti' }
        ];
        
        // Aplicar apenas 1 erro
        const erro = erros[Math.floor(Math.random() * erros.length)];
        
        if (texto.includes(erro.de)) {
            // Substituir apenas a primeira ocorrência
            return texto.replace(erro.de, erro.para);
        }
        
        return texto;
    }
    
    /**
     * Escolhe apelido adequado baseado na afinidade
     */
    static escolherApelido(afinidade, apelidos) {
        if (afinidade > 0.7) {
            return apelidos.carinhoso?.[Math.floor(Math.random() * apelidos.carinhoso.length)] || 'mano';
        } else if (afinidade > 0.4) {
            return apelidos.amigavel?.[Math.floor(Math.random() * apelidos.amigavel.length)] || 'fi';
        } else {
            return apelidos.neutro?.[Math.floor(Math.random() * apelidos.neutro.length)] || 'c';
        }
    }
    
    /**
     * Formata variáveis em templates
     */
    static formatarTemplate(template, variaveis) {
        let resultado = template;
        
        for (const [chave, valor] of Object.entries(variaveis)) {
            const regex = new RegExp(`\\{${chave}\\}`, 'g');
            resultado = resultado.replace(regex, valor);
        }
        
        return resultado;
    }
}

module.exports = LanguageTransformer;

