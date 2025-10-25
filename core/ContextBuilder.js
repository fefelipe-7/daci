/**
 * ContextBuilder - Coleta e estrutura contexto situacional completo
 * Busca histórico de mensagens, detecta mood temporal e tipo de canal
 */

class ContextBuilder {
    /**
     * Constrói contexto completo da conversa
     */
    async build(options) {
        const { channel, message, guild, historyLimit = 10 } = options;
        
        const context = {
            temporal: this.getTemporalContext(),
            channel: this.getChannelContext(channel),
            history: await this.getMessageHistory(channel, message, historyLimit),
            guild: this.getGuildContext(guild),
            mentions: this.extractMentions(message)
        };
        
        return context;
    }
    
    /**
     * Contexto temporal (horário, dia da semana)
     */
    getTemporalContext() {
        const now = new Date();
        
        // Ajustar para o fuso horário de Brasília (America/Sao_Paulo)
        const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
        const hour = brasiliaTime.getHours();
        const dayOfWeek = brasiliaTime.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Determinar período do dia
        let period;
        let mood;
        
        if (hour >= 5 && hour < 12) {
            period = 'morning';
            mood = 'energetic';
        } else if (hour >= 12 && hour < 18) {
            period = 'afternoon';
            mood = 'active';
        } else if (hour >= 18 && hour < 22) {
            period = 'evening';
            mood = 'relaxed';
        } else {
            period = 'night';
            mood = 'sleepy';
        }
        
        return {
            hour,
            period,
            mood,
            dayOfWeek,
            isWeekend,
            timestamp: now.toISOString()
        };
    }
    
    /**
     * Contexto do canal
     */
    getChannelContext(channel) {
        if (!channel) {
            return { type: 'unknown' };
        }
        
        return {
            id: channel.id,
            name: channel.name,
            type: channel.type, // 0 = text, 1 = DM, etc
            isDM: channel.type === 1,
            isThread: channel.isThread?.() || false,
            nsfw: channel.nsfw || false
        };
    }
    
    /**
     * Busca histórico de mensagens do canal com retry e backoff exponencial
     */
    async getMessageHistory(channel, currentMessage, limit = 10) {
        if (!channel || !channel.messages) {
            return [];
        }
        
        const maxAttempts = 3;
        const baseDelay = 1000; // 1 segundo
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // Buscar últimas mensagens (excluindo a atual)
                const messages = await channel.messages.fetch({ 
                    limit: limit + 1,
                    before: currentMessage?.id 
                });
                
                // Converter para array e formatar
                const history = [];
                messages.forEach(msg => {
                    // Ignorar mensagens do próprio bot e a mensagem atual
                    if (msg.author.bot && msg.author.id === currentMessage?.client?.user?.id) {
                        return;
                    }
                    
                    history.push({
                        id: msg.id,
                        author: msg.author.username,
                        authorId: msg.author.id,
                        content: msg.content.substring(0, 200), // Limitar tamanho
                        timestamp: msg.createdTimestamp,
                        isBot: msg.author.bot
                    });
                });
                
                // Ordenar por timestamp (mais antigo primeiro)
                history.sort((a, b) => a.timestamp - b.timestamp);
                
                if (attempt > 1) {
                    console.log(`[ContextBuilder] Sucesso na tentativa ${attempt}`);
                }
                
                return history.slice(0, limit);
                
            } catch (error) {
                const isLastAttempt = attempt === maxAttempts;
                const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff exponencial: 1s, 2s, 4s
                
                console.error(`[ContextBuilder] Tentativa ${attempt}/${maxAttempts} falhou: ${error.message}`);
                
                if (isLastAttempt) {
                    console.error('[ContextBuilder] Todas as tentativas falharam, retornando histórico vazio');
                    return [];
                }
                
                // Aguardar antes da próxima tentativa
                console.log(`[ContextBuilder] Aguardando ${delay}ms antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return []; // Fallback (não deveria chegar aqui)
    }
    
    /**
     * Contexto do servidor
     */
    getGuildContext(guild) {
        if (!guild) {
            return { type: 'dm' };
        }
        
        return {
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            isDM: false
        };
    }
    
    /**
     * Extrair menções da mensagem
     */
    extractMentions(message) {
        if (!message || !message.mentions) {
            return [];
        }
        
        const mentions = [];
        
        // Usuários mencionados
        if (message.mentions.users) {
            message.mentions.users.forEach(user => {
                mentions.push({
                    type: 'user',
                    id: user.id,
                    username: user.username
                });
            });
        }
        
        // Roles mencionados
        if (message.mentions.roles) {
            message.mentions.roles.forEach(role => {
                mentions.push({
                    type: 'role',
                    id: role.id,
                    name: role.name
                });
            });
        }
        
        return mentions;
    }
    
    /**
     * Analisa padrões de conversa no histórico
     */
    analyzeConversationPattern(history) {
        if (!history || history.length === 0) {
            return { active: false, participants: 0 };
        }
        
        const uniqueAuthors = new Set(history.map(m => m.authorId));
        const recentMessages = history.filter(m => 
            Date.now() - m.timestamp < 5 * 60 * 1000 // últimos 5 minutos
        );
        
        return {
            active: recentMessages.length >= 3,
            participants: uniqueAuthors.size,
            messageCount: history.length,
            recentCount: recentMessages.length
        };
    }
}

module.exports = ContextBuilder;

