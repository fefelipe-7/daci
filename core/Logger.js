/**
 * Logger - Sistema centralizado de logging otimizado
 * Logs estruturados para acompanhamento no Render sem pesar performance
 */

class Logger {
    constructor() {
        // Nível de log baseado em ambiente
        this.level = process.env.LOG_LEVEL || 'info';
        
        // Níveis de prioridade
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };

        // Cores para diferentes tipos (para terminal local)
        this.colors = {
            error: '\x1b[31m',   // Vermelho
            warn: '\x1b[33m',    // Amarelo
            info: '\x1b[36m',    // Ciano
            debug: '\x1b[90m',   // Cinza
            success: '\x1b[32m', // Verde
            reset: '\x1b[0m'
        };

        // Emojis para melhor visualização
        this.emojis = {
            error: '❌',
            warn: '⚠️',
            info: 'ℹ️',
            debug: '🔍',
            success: '✅',
            ai: '🤖',
            command: '⚡',
            message: '💬',
            event: '📡',
            music: '🎵',
            personality: '🎭',
            model: '📦'
        };
    }

    /**
     * Verifica se deve logar baseado no nível
     */
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    /**
     * Formata timestamp
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString().substring(11, 23); // HH:MM:SS.mmm
    }

    /**
     * Log formatado
     */
    log(level, category, message, data = null) {
        if (!this.shouldLog(level)) return;

        const timestamp = this.getTimestamp();
        const emoji = this.emojis[category] || this.emojis[level];
        const prefix = `[${timestamp}] ${emoji} [${category.toUpperCase()}]`;

        // Mensagem principal
        console.log(`${prefix} ${message}`);

        // Dados adicionais (apenas se fornecidos e não em produção)
        if (data && this.level === 'debug') {
            console.log(`  └─ Dados:`, JSON.stringify(data, null, 2));
        }
    }

    // ===== MÉTODOS DE CONVENIÊNCIA =====

    error(category, message, error = null) {
        this.log('error', category, message);
        if (error) {
            console.error(`  └─ Erro: ${error.message}`);
            if (this.level === 'debug' && error.stack) {
                console.error(`  └─ Stack: ${error.stack}`);
            }
        }
    }

    warn(category, message) {
        this.log('warn', category, message);
    }

    info(category, message, data = null) {
        this.log('info', category, message, data);
    }

    debug(category, message, data = null) {
        this.log('debug', category, message, data);
    }

    success(category, message) {
        const timestamp = this.getTimestamp();
        const emoji = this.emojis.success;
        console.log(`[${timestamp}] ${emoji} [${category.toUpperCase()}] ${message}`);
    }

    // ===== LOGS ESPECÍFICOS POR FEATURE =====

    /**
     * Log de mensagem recebida
     */
    messageReceived(userId, username, content, isMention, isReply) {
        const type = isMention ? 'MENÇÃO' : isReply ? 'RESPOSTA' : 'MENSAGEM';
        this.info('message', `${type} de ${username} (${userId}): "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    }

    /**
     * Log de comando executado
     */
    commandExecuted(commandName, username, userId) {
        this.info('command', `/${commandName} executado por ${username} (${userId})`);
    }

    /**
     * Log de evento Discord
     */
    discordEvent(eventName, details = '') {
        this.info('event', `${eventName}${details ? ': ' + details : ''}`);
    }

    /**
     * Log de IA
     */
    aiRequest(username, message, modelName) {
        this.info('ai', `Processando para ${username} | Modelo: ${modelName}`);
    }

    aiResponse(username, responseTime, success = true) {
        if (success) {
            this.success('ai', `Resposta gerada para ${username} em ${responseTime}ms`);
        } else {
            this.warn('ai', `Falha ao gerar resposta para ${username}`);
        }
    }

    aiModelSwitch(fromModel, toModel) {
        this.info('model', `Fallback: ${fromModel} → ${toModel}`);
    }

    aiModelLimit(modelName, used, limit) {
        const percent = ((used / limit) * 100).toFixed(1);
        this.warn('model', `${modelName}: ${used}/${limit} (${percent}%) - Limite atingido`);
    }

    /**
     * Log de personalidade
     */
    personalityLoaded(userId, username, apelido, afinidade) {
        this.info('personality', `${apelido || username} (${userId}) | Afinidade: ${afinidade.toFixed(2)}`);
    }

    personalityResponse(username, tipoRelacao, tom) {
        this.debug('personality', `${username} | Tipo: ${tipoRelacao} | Tom: ${tom}`);
    }

    /**
     * Log de música
     */
    musicPlay(guildName, songName, requestedBy) {
        this.info('music', `▶️ ${songName} | Servidor: ${guildName} | Por: ${requestedBy}`);
    }

    musicQueue(guildName, queueSize) {
        this.info('music', `Fila atualizada | Servidor: ${guildName} | Total: ${queueSize} músicas`);
    }

    musicStop(guildName) {
        this.info('music', `⏹️ Parado | Servidor: ${guildName}`);
    }

    /**
     * Log de inicialização
     */
    startup(component, status = 'success', details = '') {
        if (status === 'success') {
            this.success('startup', `${component} inicializado${details ? ' - ' + details : ''}`);
        } else {
            this.warn('startup', `${component} com problemas${details ? ': ' + details : ''}`);
        }
    }

    /**
     * Log de performance
     */
    performance(operation, duration) {
        const level = duration > 2000 ? 'warn' : 'debug';
        const emoji = duration > 2000 ? '🐌' : '⚡';
        if (this.shouldLog(level)) {
            console.log(`[${this.getTimestamp()}] ${emoji} [PERFORMANCE] ${operation}: ${duration}ms`);
        }
    }

    /**
     * Separator para organização visual
     */
    separator(title = '') {
        if (this.shouldLog('info')) {
            console.log('\n' + '='.repeat(60));
            if (title) console.log(`  ${title}`);
            console.log('='.repeat(60) + '\n');
        }
    }

    /**
     * Stats resumidas
     */
    stats(stats) {
        if (this.shouldLog('info')) {
            console.log(`\n📊 [STATS] Estatísticas:`);
            Object.entries(stats).forEach(([key, value]) => {
                console.log(`  • ${key}: ${value}`);
            });
            console.log('');
        }
    }
}

// Singleton
const logger = new Logger();

module.exports = logger;

