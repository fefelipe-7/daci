const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
    constructor() {
        this.db = new Database(path.join(__dirname, 'bot.db'));
        this.initTables();
    }

    initTables() {
        // Tabela de usuários
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT,
                guild_id TEXT,
                points INTEGER DEFAULT 0,
                daily_rolls INTEGER DEFAULT 5,
                last_daily_reset TEXT,
                inventory TEXT DEFAULT '[]',
                PRIMARY KEY (user_id, guild_id)
            )
        `);

        // Tabela de logs de moderação
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS moderation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                moderator_id TEXT,
                target_id TEXT,
                action TEXT,
                reason TEXT,
                timestamp TEXT
            )
        `);

        // Tabela de configurações do servidor
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS guild_configs (
                guild_id TEXT PRIMARY KEY,
                config TEXT DEFAULT '{}'
            )
        `);

        // Tabela de interações de IA
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ai_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                guild_id TEXT,
                timestamp TEXT,
                message_input TEXT,
                response_output TEXT,
                model_used TEXT,
                response_time INTEGER,
                tokens_used INTEGER,
                success BOOLEAN,
                fallback_level INTEGER,
                metadata TEXT
            )
        `);
    }

    // Métodos para usuários
    async getUserData(userId, guildId) {
        const stmt = this.db.prepare(`
            SELECT * FROM users WHERE user_id = ? AND guild_id = ?
        `);
        
        let user = stmt.get(userId, guildId);
        
        if (!user) {
            // Criar usuário se não existir
            const insertStmt = this.db.prepare(`
                INSERT INTO users (user_id, guild_id, points, daily_rolls, last_daily_reset)
                VALUES (?, ?, 0, 5, ?)
            `);
            insertStmt.run(userId, guildId, new Date().toISOString().split('T')[0]);
            
            user = {
                user_id: userId,
                guild_id: guildId,
                points: 0,
                daily_rolls: 5,
                last_daily_reset: new Date().toISOString().split('T')[0],
                inventory: []
            };
        } else {
            // Verificar se precisa resetar rolls diários
            const today = new Date().toISOString().split('T')[0];
            if (user.last_daily_reset !== today) {
                this.updateDailyRolls(userId, guildId, 5);
                this.updateLastDailyReset(userId, guildId, today);
                user.daily_rolls = 5;
            }
            
            // Parse do inventário
            user.inventory = JSON.parse(user.inventory || '[]');
        }
        
        return user;
    }

    async updatePoints(userId, guildId, points) {
        const stmt = this.db.prepare(`
            UPDATE users SET points = ? WHERE user_id = ? AND guild_id = ?
        `);
        stmt.run(points, userId, guildId);
    }

    async updateDailyRolls(userId, guildId, rolls) {
        const stmt = this.db.prepare(`
            UPDATE users SET daily_rolls = ? WHERE user_id = ? AND guild_id = ?
        `);
        stmt.run(rolls, userId, guildId);
    }

    async updateLastDailyReset(userId, guildId, date) {
        const stmt = this.db.prepare(`
            UPDATE users SET last_daily_reset = ? WHERE user_id = ? AND guild_id = ?
        `);
        stmt.run(date, userId, guildId);
    }

    async addToInventory(userId, guildId, character) {
        const userData = await this.getUserData(userId, guildId);
        const inventory = userData.inventory || [];
        
        // Verificar se já existe
        const existing = inventory.find(item => 
            item.name === character.name && item.rarity === character.rarity
        );
        
        if (existing) {
            existing.count = (existing.count || 1) + 1;
        } else {
            inventory.push({ ...character, count: 1 });
        }
        
        const stmt = this.db.prepare(`
            UPDATE users SET inventory = ? WHERE user_id = ? AND guild_id = ?
        `);
        stmt.run(JSON.stringify(inventory), userId, guildId);
    }

    // Métodos para logs de moderação
    async logModerationAction(guildId, moderatorId, targetId, action, reason) {
        const stmt = this.db.prepare(`
            INSERT INTO moderation_logs (guild_id, moderator_id, target_id, action, reason, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(guildId, moderatorId, targetId, action, reason, new Date().toISOString());
    }

    async getModerationLogs(guildId, limit = 10) {
        const stmt = this.db.prepare(`
            SELECT * FROM moderation_logs 
            WHERE guild_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        `);
        return stmt.all(guildId, limit);
    }

    // Métodos para configurações
    async getGuildConfig(guildId) {
        const stmt = this.db.prepare(`
            SELECT config FROM guild_configs WHERE guild_id = ?
        `);
        const result = stmt.get(guildId);
        return result ? JSON.parse(result.config) : {};
    }

    async updateGuildConfig(guildId, config) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO guild_configs (guild_id, config)
            VALUES (?, ?)
        `);
        stmt.run(guildId, JSON.stringify(config));
    }

    // Método para fechar conexão
    close() {
        this.db.close();
    }
}

module.exports = new DatabaseManager();
