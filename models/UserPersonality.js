const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Criar diretório database se não existir
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'personality.db'));

// Personalidade base do Daci Bot
const PERSONALIDADE_BASE_BOT = {
    sarcasmo: 0.85,
    criatividade: 0.90,
    humor_negro: 0.75,
    lealdade: 0.80,
    zoeira_geral: 0.85,
    extroversao: 0.70,
    // Neutros (0.5)
    sensibilidade: 0.50,
    lideranca: 0.50,
    afinidade: 0.50,
    espontaneidade: 0.50,
    paciencia: 0.50,
    empatia: 0.50,
    dominancia: 0.50,
    autoestima: 0.50,
    curiosidade: 0.50
};

// Lista de parâmetros válidos
const PARAMETROS_VALIDOS = [
    'extroversao', 'sarcasmo', 'sensibilidade', 'lideranca', 'afinidade',
    'espontaneidade', 'paciencia', 'criatividade', 'humor_negro', 'empatia',
    'zoeira_geral', 'lealdade', 'dominancia', 'autoestima', 'curiosidade'
];

// Criar tabela se não existir
db.exec(`
    CREATE TABLE IF NOT EXISTS user_personalities (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        username TEXT,
        
        -- 15 parâmetros psicológicos
        extroversao REAL DEFAULT 0.5,
        sarcasmo REAL DEFAULT 0.5,
        sensibilidade REAL DEFAULT 0.5,
        lideranca REAL DEFAULT 0.5,
        afinidade REAL DEFAULT 0.5,
        espontaneidade REAL DEFAULT 0.5,
        paciencia REAL DEFAULT 0.5,
        criatividade REAL DEFAULT 0.5,
        humor_negro REAL DEFAULT 0.5,
        empatia REAL DEFAULT 0.5,
        zoeira_geral REAL DEFAULT 0.5,
        lealdade REAL DEFAULT 0.5,
        dominancia REAL DEFAULT 0.5,
        autoestima REAL DEFAULT 0.5,
        curiosidade REAL DEFAULT 0.5,
        
        -- Contador de interações
        interaction_count INTEGER DEFAULT 0,
        
        -- Timestamps
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (user_id, guild_id)
    )
`);

class UserPersonality {
    /**
     * Buscar perfil de um usuário ou criar com valores neutros (0.5)
     */
    static get(userId, guildId) {
        const stmt = db.prepare(`
            SELECT * FROM user_personalities 
            WHERE user_id = ? AND guild_id = ?
        `);
        
        let profile = stmt.get(userId, guildId);
        
        // Se não existe, criar com valores padrão
        if (!profile) {
            profile = this.create(userId, guildId);
        }
        
        return profile;
    }
    
    /**
     * Criar novo perfil com valores neutros
     */
    static create(userId, guildId, username = 'Unknown') {
        const stmt = db.prepare(`
            INSERT INTO user_personalities (user_id, guild_id, username)
            VALUES (?, ?, ?)
        `);
        
        stmt.run(userId, guildId, username);
        return this.get(userId, guildId);
    }
    
    /**
     * Atualizar múltiplos parâmetros de uma vez
     */
    static update(userId, guildId, parametros) {
        const fields = [];
        const values = [];
        
        // Validar e preparar campos para atualização
        for (const [param, value] of Object.entries(parametros)) {
            if (PARAMETROS_VALIDOS.includes(param)) {
                // Clamp entre 0.0 e 1.0
                const clampedValue = Math.max(0.0, Math.min(1.0, parseFloat(value)));
                fields.push(`${param} = ?`);
                values.push(clampedValue);
            } else if (param === 'username') {
                fields.push('username = ?');
                values.push(value);
            }
        }
        
        if (fields.length === 0) {
            return this.get(userId, guildId);
        }
        
        // Atualizar timestamp
        fields.push('updated_at = datetime(\'now\')');
        
        values.push(userId, guildId);
        
        const stmt = db.prepare(`
            UPDATE user_personalities 
            SET ${fields.join(', ')}
            WHERE user_id = ? AND guild_id = ?
        `);
        
        stmt.run(...values);
        
        return this.get(userId, guildId);
    }
    
    /**
     * Atualizar um único parâmetro
     */
    static setParameter(userId, guildId, param, value) {
        if (!PARAMETROS_VALIDOS.includes(param)) {
            throw new Error(`Parâmetro inválido: ${param}`);
        }
        
        const clampedValue = Math.max(0.0, Math.min(1.0, parseFloat(value)));
        
        const stmt = db.prepare(`
            UPDATE user_personalities 
            SET ${param} = ?, updated_at = datetime('now')
            WHERE user_id = ? AND guild_id = ?
        `);
        
        stmt.run(clampedValue, userId, guildId);
        
        return this.get(userId, guildId);
    }
    
    /**
     * Incrementar contador de interações
     */
    static incrementInteraction(userId, guildId) {
        const stmt = db.prepare(`
            UPDATE user_personalities 
            SET interaction_count = interaction_count + 1,
                updated_at = datetime('now')
            WHERE user_id = ? AND guild_id = ?
        `);
        
        stmt.run(userId, guildId);
    }
    
    /**
     * Listar todos os perfis de um servidor
     */
    static getAll(guildId) {
        const stmt = db.prepare(`
            SELECT * FROM user_personalities 
            WHERE guild_id = ?
            ORDER BY updated_at DESC
        `);
        
        return stmt.all(guildId);
    }
    
    /**
     * Listar apenas perfis customizados (não neutros)
     */
    static getCustomized(guildId) {
        // Perfis customizados são aqueles onde pelo menos um parâmetro != 0.5
        const stmt = db.prepare(`
            SELECT * FROM user_personalities 
            WHERE guild_id = ?
            AND (
                extroversao != 0.5 OR sarcasmo != 0.5 OR sensibilidade != 0.5 OR
                lideranca != 0.5 OR afinidade != 0.5 OR espontaneidade != 0.5 OR
                paciencia != 0.5 OR criatividade != 0.5 OR humor_negro != 0.5 OR
                empatia != 0.5 OR zoeira_geral != 0.5 OR lealdade != 0.5 OR
                dominancia != 0.5 OR autoestima != 0.5 OR curiosidade != 0.5
            )
            ORDER BY updated_at DESC
        `);
        
        return stmt.all(guildId);
    }
    
    /**
     * Resetar perfil para valores neutros (0.5)
     */
    static delete(userId, guildId) {
        const stmt = db.prepare(`
            UPDATE user_personalities 
            SET 
                extroversao = 0.5, sarcasmo = 0.5, sensibilidade = 0.5,
                lideranca = 0.5, afinidade = 0.5, espontaneidade = 0.5,
                paciencia = 0.5, criatividade = 0.5, humor_negro = 0.5,
                empatia = 0.5, zoeira_geral = 0.5, lealdade = 0.5,
                dominancia = 0.5, autoestima = 0.5, curiosidade = 0.5,
                interaction_count = 0,
                updated_at = datetime('now')
            WHERE user_id = ? AND guild_id = ?
        `);
        
        stmt.run(userId, guildId);
        
        return this.get(userId, guildId);
    }
    
    /**
     * Verificar se um parâmetro é válido
     */
    static isValidParameter(param) {
        return PARAMETROS_VALIDOS.includes(param);
    }
    
    /**
     * Obter lista de parâmetros válidos
     */
    static getValidParameters() {
        return [...PARAMETROS_VALIDOS];
    }
    
    /**
     * Obter personalidade base do bot
     */
    static getBasePersonality() {
        return { ...PERSONALIDADE_BASE_BOT };
    }
}

module.exports = UserPersonality;

