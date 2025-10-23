/**
 * SentimentAnalyzer - Análise local de sentimento usando biblioteca sentiment
 * Detecta emoção, intensidade e palavras-chave
 */

const Sentiment = require('sentiment');

class SentimentAnalyzer {
    constructor() {
        this.sentiment = new Sentiment();
        
        // Dicionário customizado para português brasileiro
        this.customDict = {
            // Positivos
            'massa': 3,
            'top': 3,
            'demais': 3,
            'daora': 3,
            'foda': 4,
            'brabo': 3,
            'show': 3,
            'legal': 2,
            'maneiro': 2,
            'bacana': 2,
            'ótimo': 3,
            'otimo': 3,
            'perfeito': 4,
            'incrível': 4,
            'incrivel': 4,
            'adorei': 3,
            'amei': 4,
            'sucesso': 3,
            'parabéns': 3,
            'parabens': 3,
            
            // Negativos
            'ruim': -2,
            'péssimo': -4,
            'pessimo': -4,
            'horrível': -4,
            'horrivel': -4,
            'merda': -3,
            'bosta': -3,
            'lixo': -4,
            'nojento': -3,
            'chato': -2,
            'entediante': -2,
            'aff': -2,
            'droga': -2,
            'lasquei': -2,
            'bad': -2,
            'triste': -3,
            'tristeza': -3,
            'depressão': -4,
            'depressao': -4,
            
            // Intensificadores
            'muito': 2,
            'mt': 2,
            'demais': 2,
            'super': 2,
            'mega': 2,
            'extremamente': 3,
            'pra': 0,
            'caramba': 0,
            'caralho': 0
        };
    }
    
    /**
     * Analisa sentimento completo de uma mensagem
     */
    analyze(text) {
        if (!text || typeof text !== 'string') {
            return this.getDefaultAnalysis();
        }
        
        // Análise base com sentiment library
        const result = this.sentiment.analyze(text, {
            extras: this.customDict
        });
        
        // Análise customizada adicional
        const customAnalysis = this.analyzeCustomPatterns(text);
        
        // Combinar resultados
        const finalScore = result.score + customAnalysis.scoreAdjustment;
        
        return {
            score: finalScore,
            comparative: result.comparative,
            classification: this.classifyEmotion(finalScore, text),
            intensity: this.calculateIntensity(text, finalScore),
            emotions: this.detectEmotions(text),
            keywords: this.extractKeywords(text, result.positive, result.negative),
            confidence: this.calculateConfidence(result, text)
        };
    }
    
    /**
     * Análise de padrões customizados para português
     */
    analyzeCustomPatterns(text) {
        const lower = text.toLowerCase();
        let scoreAdjustment = 0;
        
        // Padrões de repetição (kkkk, hahaha)
        if (lower.match(/k{3,}|h(ah)+a|r(sr)+s|l(ol)+/)) {
            scoreAdjustment += 2; // Riso é positivo
        }
        
        // Emojis positivos
        const positiveEmojis = /😊|😄|😁|🥰|😍|❤️|💕|👍|✨|🎉|🔥/g;
        const positiveEmojiCount = (text.match(positiveEmojis) || []).length;
        scoreAdjustment += positiveEmojiCount * 2;
        
        // Emojis negativos
        const negativeEmojis = /😢|😭|😞|😔|😩|😡|😤|💔|😰/g;
        const negativeEmojiCount = (text.match(negativeEmojis) || []).length;
        scoreAdjustment -= negativeEmojiCount * 2;
        
        // Exclamações múltiplas (aumenta intensidade, não necessariamente positivo)
        const exclamations = (text.match(/!/g) || []).length;
        if (exclamations >= 3) {
            scoreAdjustment += Math.min(exclamations, 5);
        }
        
        // Palavrões (contexto neutro/intensificador)
        if (lower.match(/\b(porra|caralho|pqp|krl)\b/)) {
            // Não ajusta score (pode ser positivo ou negativo dependendo contexto)
        }
        
        return { scoreAdjustment };
    }
    
    /**
     * Classifica emoção baseada no score
     */
    classifyEmotion(score, text) {
        const lower = text.toLowerCase();
        
        // Verificar padrões específicos primeiro
        if (lower.match(/\b(raiva|ódio|odio|puto|nervoso|irritado)\b/)) {
            return 'angry';
        }
        if (lower.match(/\b(triste|depressão|depressao|chateado|mal)\b/)) {
            return 'sad';
        }
        if (lower.match(/\b(feliz|alegre|animado|empolgado)\b/)) {
            return 'happy';
        }
        if (lower.match(/\b(medo|assustado|preocupado|ansioso)\b/)) {
            return 'fearful';
        }
        if (lower.match(/\b(surpreso|nossa|caramba|uau|wow)\b/)) {
            return 'surprised';
        }
        
        // Classificação por score
        if (score > 3) return 'very_positive';
        if (score > 1) return 'positive';
        if (score < -3) return 'very_negative';
        if (score < -1) return 'negative';
        return 'neutral';
    }
    
    /**
     * Calcula intensidade emocional (0-1)
     */
    calculateIntensity(text, score) {
        let intensity = Math.abs(score) * 0.1;
        
        // Maiúsculas aumentam intensidade
        const upperRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        intensity += upperRatio * 0.3;
        
        // Exclamações
        const exclamations = (text.match(/!/g) || []).length;
        intensity += Math.min(exclamations * 0.1, 0.3);
        
        // Repetições (aaaaa, nooossa)
        if (text.match(/(.)\1{3,}/)) {
            intensity += 0.2;
        }
        
        return Math.min(intensity, 1.0);
    }
    
    /**
     * Detecta emoções múltiplas presentes
     */
    detectEmotions(text) {
        const lower = text.toLowerCase();
        const emotions = [];
        
        const patterns = {
            joy: /\b(feliz|alegre|legal|bom|ótimo|show|massa|top|kkkk|haha)\b/,
            sadness: /\b(triste|ruim|bad|péssimo|depressão|chateado)\b/,
            anger: /\b(raiva|ódio|puto|nervoso|irritado|aff|pqp)\b/,
            fear: /\b(medo|assustado|preocupado|ansioso|tenso)\b/,
            surprise: /\b(nossa|caramba|eita|vish|uau|wow|sério)\b/,
            love: /\b(amo|adoro|amei|adorei|lindo|perfeito)\b/,
            disgust: /\b(nojo|nojento|horrível|asqueroso|repugnante)\b/
        };
        
        for (const [emotion, pattern] of Object.entries(patterns)) {
            if (lower.match(pattern)) {
                emotions.push(emotion);
            }
        }
        
        return emotions.length > 0 ? emotions : ['neutral'];
    }
    
    /**
     * Extrai palavras-chave relevantes
     */
    extractKeywords(text, positiveWords, negativeWords) {
        const keywords = [];
        
        // Adicionar palavras positivas
        positiveWords.forEach(word => {
            if (word.length > 3) {
                keywords.push({ word, sentiment: 'positive' });
            }
        });
        
        // Adicionar palavras negativas
        negativeWords.forEach(word => {
            if (word.length > 3) {
                keywords.push({ word, sentiment: 'negative' });
            }
        });
        
        return keywords.slice(0, 10); // Limitar a 10 palavras-chave
    }
    
    /**
     * Calcula confiança da análise
     */
    calculateConfidence(result, text) {
        let confidence = 0.5;
        
        // Mais palavras de sentimento = maior confiança
        const totalSentimentWords = result.positive.length + result.negative.length;
        confidence += Math.min(totalSentimentWords * 0.05, 0.3);
        
        // Texto mais longo = mais contexto = maior confiança
        const wordCount = text.split(/\s+/).length;
        confidence += Math.min(wordCount * 0.01, 0.2);
        
        return Math.min(confidence, 1.0);
    }
    
    /**
     * Retorna análise padrão quando não há texto
     */
    getDefaultAnalysis() {
        return {
            score: 0,
            comparative: 0,
            classification: 'neutral',
            intensity: 0,
            emotions: ['neutral'],
            keywords: [],
            confidence: 0
        };
    }
    
    /**
     * Analisa se o sentimento mudou comparado ao histórico
     */
    compareSentiment(current, previous) {
        if (!previous) {
            return { changed: false, shift: 0 };
        }
        
        const shift = current.score - previous.score;
        const changed = Math.abs(shift) > 2;
        
        let direction = 'stable';
        if (shift > 2) direction = 'more_positive';
        else if (shift < -2) direction = 'more_negative';
        
        return { changed, shift, direction };
    }
}

module.exports = SentimentAnalyzer;

