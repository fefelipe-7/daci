/**
 * HistoryCompressor - Compressor de histórico
 * 
 * Comprime históricos longos para economizar tokens
 * mantendo mensagens recentes detalhadas
 */

const PromptConfig = require('./PromptConfig');

class HistoryCompressor {
    /**
     * Comprime histórico se muito longo
     */
    compressHistory(history) {
        const MAX_TOKENS = PromptConfig.HISTORY_TOKEN_LIMIT;
        const MAX_RECENT_MESSAGES = 3;
        
        // Calcular tokens estimados do histórico completo
        let fullHistory = '';
        history.slice(-8).forEach((msg, index) => {
            const author = msg.isBot ? '[Você - Daci]' : `[${msg.author}]`;
            const content = msg.content.substring(0, PromptConfig.MAX_MESSAGE_CHARS);
            const indicator = index === history.slice(-8).length - 1 ? ' ⬅️ (mais recente)' : '';
            fullHistory += `${author}: ${content}${indicator}\n`;
        });
        
        const estimatedTokens = this.estimateTokens(fullHistory);
        
        // Se está dentro do limite, retornar completo
        if (estimatedTokens < MAX_TOKENS * 0.6) {
            return `=== HISTÓRICO DA CONVERSA (do mais antigo ao mais recente) ===\n${fullHistory}\n=== FIM DO HISTÓRICO ===\n`;
        }
        
        // COMPRESSÃO: Últimas 3 detalhadas + resumo das antigas
        const recentMessages = history.slice(-MAX_RECENT_MESSAGES);
        const oldMessages = history.slice(0, -MAX_RECENT_MESSAGES);
        
        let compressed = '=== HISTÓRICO DA CONVERSA ===\n';
        
        // Resumir mensagens antigas
        if (oldMessages.length > 0) {
            const topics = this.extractTopicsFromHistory(oldMessages);
            compressed += `[Resumo de ${oldMessages.length} mensagens anteriores: conversaram sobre ${topics.join(', ')}]\n\n`;
        }
        
        // Adicionar últimas 3 mensagens detalhadas
        compressed += '=== MENSAGENS RECENTES ===\n';
        recentMessages.forEach((msg, index) => {
            const author = msg.isBot ? '[Você - Daci]' : `[${msg.author}]`;
            const content = msg.content.substring(0, 200);
            const indicator = index === recentMessages.length - 1 ? ' ⬅️ (atual)' : '';
            compressed += `${author}: ${content}${indicator}\n`;
        });
        
        compressed += '\n=== FIM DO HISTÓRICO ===\n';
        
        return compressed;
    }
    
    /**
     * Estima número de tokens (1 token ≈ 4 caracteres em PT-BR)
     */
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    
    /**
     * Extrai tópicos principais de mensagens antigas
     */
    extractTopicsFromHistory(messages) {
        const topics = new Set();
        const keywords = ['meme', 'música', 'jogo', 'anime', 'filme', 'comida', 'trabalho', 'pizza', 'festa'];
        
        messages.forEach(msg => {
            const content = msg.content.toLowerCase();
            keywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    topics.add(keyword);
                }
            });
        });
        
        return topics.size > 0 ? Array.from(topics) : ['assuntos gerais'];
    }
}

module.exports = HistoryCompressor;

