/**
 * MetricsCollector - Sistema de logs dual (arquivo JSON + SQLite)
 * Registra todas as interações de IA para análise e melhoria contínua
 */

const fs = require('fs');
const path = require('path');

class MetricsCollector {
    constructor(database = null) {
        this.database = database;
        this.logsDir = path.join(__dirname, '..', 'logs', 'metrics');
        this.ensureLogsDirectory();
    }
    
    /**
     * Garante que diretório de logs existe
     */
    ensureLogsDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }
    
    /**
     * Registra interação completa em ambos os sistemas
     */
    async logInteraction(data) {
        const record = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...data
        };
        
        // 1. Salvar em arquivo JSON
        await this.logToFile(record);
        
        // 2. Salvar no banco de dados (se disponível)
        if (this.database) {
            await this.logToDatabase(record);
        }
        
        return record.id;
    }
    
    /**
     * Salva log em arquivo JSON diário
     */
    async logToFile(record) {
        try {
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const filename = `metrics_${date}.json`;
            const filepath = path.join(this.logsDir, filename);
            
            let logs = [];
            
            // Carregar logs existentes do dia
            if (fs.existsSync(filepath)) {
                try {
                    const content = fs.readFileSync(filepath, 'utf8');
                    logs = JSON.parse(content);
                } catch (error) {
                    console.error('[MetricsCollector] Erro ao ler arquivo de logs:', error.message);
                    logs = [];
                }
            }
            
            // Adicionar novo registro
            logs.push(record);
            
            // Salvar de volta
            fs.writeFileSync(filepath, JSON.stringify(logs, null, 2), 'utf8');
            
        } catch (error) {
            console.error('[MetricsCollector] Erro ao salvar log em arquivo:', error);
        }
    }
    
    /**
     * Salva log no banco de dados SQLite
     */
    async logToDatabase(record) {
        if (!this.database || !this.database.db) {
            return;
        }
        
        try {
            const stmt = this.database.db.prepare(`
                INSERT INTO ai_interactions (
                    user_id, guild_id, timestamp, message_input, 
                    response_output, model_used, response_time, 
                    tokens_used, success, fallback_level, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(
                record.userId || null,
                record.guildId || null,
                record.timestamp,
                this.truncate(record.input, 1000),
                this.truncate(record.output, 1000),
                record.model || 'unknown',
                record.responseTime || 0,
                record.tokensUsed || 0,
                record.success ? 1 : 0,
                record.fallbackLevel || 0,
                JSON.stringify(record.metadata || {})
            );
            
        } catch (error) {
            console.error('[MetricsCollector] Erro ao salvar no banco:', error.message);
        }
    }
    
    /**
     * Registra sucesso de IA
     */
    async logSuccess(data) {
        return await this.logInteraction({
            ...data,
            success: true,
            fallbackLevel: 0
        });
    }
    
    /**
     * Registra falha e fallback
     */
    async logFailure(data) {
        return await this.logInteraction({
            ...data,
            success: false,
            fallbackLevel: data.fallbackLevel || 1
        });
    }
    
    /**
     * Obtém estatísticas do dia
     */
    async getDailyStats(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const filename = `metrics_${targetDate}.json`;
        const filepath = path.join(this.logsDir, filename);
        
        if (!fs.existsSync(filepath)) {
            return this.getEmptyStats();
        }
        
        try {
            const content = fs.readFileSync(filepath, 'utf8');
            const logs = JSON.parse(content);
            
            return this.calculateStats(logs);
            
        } catch (error) {
            console.error('[MetricsCollector] Erro ao calcular estatísticas:', error.message);
            return this.getEmptyStats();
        }
    }
    
    /**
     * Calcula estatísticas de um conjunto de logs
     */
    calculateStats(logs) {
        const total = logs.length;
        const successful = logs.filter(l => l.success).length;
        const failed = logs.filter(l => !l.success).length;
        
        // Tempo médio de resposta
        const responseTimes = logs
            .filter(l => l.responseTime)
            .map(l => l.responseTime);
        const avgResponseTime = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;
        
        // Modelos mais usados
        const modelUsage = {};
        logs.forEach(l => {
            const model = l.model || 'unknown';
            modelUsage[model] = (modelUsage[model] || 0) + 1;
        });
        
        // Tokens total
        const totalTokens = logs
            .filter(l => l.tokensUsed)
            .reduce((sum, l) => sum + l.tokensUsed, 0);
        
        // Fallback levels
        const fallbackLevels = {
            0: logs.filter(l => l.fallbackLevel === 0).length,
            1: logs.filter(l => l.fallbackLevel === 1).length,
            2: logs.filter(l => l.fallbackLevel === 2).length,
            3: logs.filter(l => l.fallbackLevel === 3).length
        };
        
        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? ((successful / total) * 100).toFixed(1) + '%' : '0%',
            avgResponseTime: avgResponseTime + 'ms',
            totalTokens,
            modelUsage,
            fallbackLevels
        };
    }
    
    /**
     * Retorna estatísticas vazias
     */
    getEmptyStats() {
        return {
            total: 0,
            successful: 0,
            failed: 0,
            successRate: '0%',
            avgResponseTime: '0ms',
            totalTokens: 0,
            modelUsage: {},
            fallbackLevels: { 0: 0, 1: 0, 2: 0, 3: 0 }
        };
    }
    
    /**
     * Obtém estatísticas do banco de dados
     */
    async getDatabaseStats(days = 7) {
        if (!this.database || !this.database.db) {
            return null;
        }
        
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoff = cutoffDate.toISOString();
            
            const stmt = this.database.db.prepare(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
                    AVG(response_time) as avg_response_time,
                    SUM(tokens_used) as total_tokens,
                    model_used
                FROM ai_interactions
                WHERE timestamp > ?
                GROUP BY model_used
            `);
            
            const results = stmt.all(cutoff);
            return results;
            
        } catch (error) {
            console.error('[MetricsCollector] Erro ao buscar stats do banco:', error.message);
            return null;
        }
    }
    
    /**
     * Limpa logs antigos (arquivos com mais de N dias)
     */
    async cleanOldLogs(daysToKeep = 30) {
        try {
            const files = fs.readdirSync(this.logsDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            let deletedCount = 0;
            
            files.forEach(file => {
                if (!file.startsWith('metrics_') || !file.endsWith('.json')) {
                    return;
                }
                
                // Extrair data do nome do arquivo
                const match = file.match(/metrics_(\d{4}-\d{2}-\d{2})\.json/);
                if (!match) return;
                
                const fileDate = new Date(match[1]);
                
                if (fileDate < cutoffDate) {
                    const filepath = path.join(this.logsDir, file);
                    fs.unlinkSync(filepath);
                    deletedCount++;
                }
            });
            
            return deletedCount;
            
        } catch (error) {
            console.error('[MetricsCollector] Erro ao limpar logs antigos:', error.message);
            return 0;
        }
    }
    
    /**
     * Gera ID único para registro
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Trunca string para evitar logs muito grandes
     */
    truncate(str, maxLength) {
        if (!str || typeof str !== 'string') return '';
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }
    
    /**
     * Exporta estatísticas consolidadas
     */
    async exportStats(outputPath = null) {
        const files = fs.readdirSync(this.logsDir);
        const allLogs = [];
        
        files.forEach(file => {
            if (file.startsWith('metrics_') && file.endsWith('.json')) {
                const filepath = path.join(this.logsDir, file);
                try {
                    const content = fs.readFileSync(filepath, 'utf8');
                    const logs = JSON.parse(content);
                    allLogs.push(...logs);
                } catch (error) {
                    console.error(`[MetricsCollector] Erro ao ler ${file}:`, error.message);
                }
            }
        });
        
        const stats = this.calculateStats(allLogs);
        
        const output = {
            generated: new Date().toISOString(),
            totalDays: files.length,
            totalInteractions: allLogs.length,
            stats
        };
        
        if (outputPath) {
            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
        }
        
        return output;
    }
}

module.exports = MetricsCollector;

