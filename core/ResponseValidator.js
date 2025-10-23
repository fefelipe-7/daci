/**
 * ResponseValidator - Valida qualidade e segurança das respostas
 * Garante que respostas não são vazias, truncadas ou problemáticas
 */

class ResponseValidator {
    /**
     * Verifica se resposta é válida (não vazia, não truncada)
     */
    static isValid(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }
        
        // Muito curta
        if (text.trim().length < 2) {
            return false;
        }
        
        // Apenas espaços ou caracteres especiais
        if (!text.match(/[a-zA-Z0-9áéíóúãõâêôàçÁÉÍÓÚÃÕÂÊÔÀÇ]/)) {
            return false;
        }
        
        // Parece truncada (termina abruptamente sem pontuação)
        const trimmed = text.trim();
        const lastChar = trimmed[trimmed.length - 1];
        const endsWithLetter = lastChar.match(/[a-zA-Záéíóúãõâêôàç]/i);
        const seemsTruncated = endsWithLetter && trimmed.length > 100;
        
        if (seemsTruncated) {
            // Verificar se parece ser truncamento real ou só estilo informal
            const hasCompleteSentence = trimmed.match(/[.!?]\s/);
            if (!hasCompleteSentence && trimmed.length > 150) {
                return false; // Provavelmente truncada
            }
        }
        
        return true;
    }
    
    /**
     * Verifica se conteúdo é seguro (sem spam, sem repetição excessiva)
     */
    static isSafe(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }
        
        // Repetição excessiva do mesmo caractere
        const repeatedChar = text.match(/(.)\1{20,}/);
        if (repeatedChar) {
            return false;
        }
        
        // Repetição excessiva da mesma palavra
        const words = text.toLowerCase().split(/\s+/);
        const wordCount = {};
        words.forEach(word => {
            if (word.length > 2) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });
        
        // Se alguma palavra aparece mais de 30% das vezes
        const maxWordRepeat = Math.max(...Object.values(wordCount));
        if (maxWordRepeat > words.length * 0.3 && words.length > 10) {
            return false;
        }
        
        // Texto suspeito de erro/placeholder
        const suspiciousPatterns = [
            /\[object Object\]/i,
            /undefined/i,
            /null/i,
            /NaN/i,
            /\[ERROR\]/i,
            /\[DEBUG\]/i,
            /<script>/i,
            /<iframe>/i
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(text)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Verifica se tem qualidade mínima (faz sentido)
     */
    static hasMinimumQuality(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }
        
        const trimmed = text.trim();
        
        // Muito curta (menos de 3 caracteres)
        if (trimmed.length < 3) {
            return false;
        }
        
        // Apenas números
        if (trimmed.match(/^[\d\s.,!?]+$/)) {
            return false;
        }
        
        // Proporção razoável de vogais (texto real tem ~40% de vogais)
        const vowels = trimmed.match(/[aeiouáéíóúãõâêôAEIOUÁÉÍÓÚÃÕÂÊÔ]/g) || [];
        const letters = trimmed.match(/[a-záéíóúãõâêôàçA-ZÁÉÍÓÚÃÕÂÊÔÀÇ]/g) || [];
        
        if (letters.length > 0) {
            const vowelRatio = vowels.length / letters.length;
            if (vowelRatio < 0.2 || vowelRatio > 0.7) {
                return false; // Texto suspeito
            }
        }
        
        // Tem pelo menos uma palavra com 3+ letras
        const hasRealWord = trimmed.match(/[a-záéíóúãõâêôàç]{3,}/i);
        if (!hasRealWord) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Validação completa (combina todas as verificações)
     */
    static validateAll(text) {
        const checks = {
            isValid: this.isValid(text),
            isSafe: this.isSafe(text),
            hasQuality: this.hasMinimumQuality(text)
        };
        
        const allPassed = checks.isValid && checks.isSafe && checks.hasQuality;
        
        return {
            passed: allPassed,
            checks,
            reason: this.getFailReason(checks)
        };
    }
    
    /**
     * Retorna motivo da falha
     */
    static getFailReason(checks) {
        if (!checks.isValid) return 'resposta_invalida';
        if (!checks.isSafe) return 'conteudo_inseguro';
        if (!checks.hasQuality) return 'qualidade_baixa';
        return null;
    }
    
    /**
     * Calcula score de qualidade (0-1)
     */
    static calculateQualityScore(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }
        
        let score = 0;
        
        // Tamanho razoável (10-500 caracteres é bom para chat)
        const length = text.trim().length;
        if (length >= 10 && length <= 500) {
            score += 0.3;
        } else if (length > 500) {
            score += 0.1; // Penalidade por muito longo
        }
        
        // Tem pontuação (texto estruturado)
        if (text.match(/[.!?,;]/)) {
            score += 0.2;
        }
        
        // Variedade de palavras
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const variety = uniqueWords.size / words.length;
        score += variety * 0.3;
        
        // Não tem repetição excessiva
        if (this.isSafe(text)) {
            score += 0.2;
        }
        
        return Math.min(score, 1.0);
    }
}

module.exports = ResponseValidator;

