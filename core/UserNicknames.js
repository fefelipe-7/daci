/**
 * Sistema de reconhecimento e apelidos de usuários conhecidos
 * 
 * Usuários conhecidos têm apelidos específicos
 * Usuários desconhecidos são chamados de "random"
 */

// Mapeamento de User ID -> Apelido
const KNOWN_USERS = {
    // Rest
    '1428244923970490483': 'Rest',
    
    // Near
    '1340544045268733964': 'Near',
    
    // Pure
    '669563573256716309': 'Pure',
    
    // Madu
    '756986971527577670': 'Madu',
    
    // Vic
    '1183874010686164994': 'Vic',
    
    // Tim
    '455428688314630164': 'Tim',
    
    // PH
    '700394542783791244': 'PH',
    
    // Peu
    '1429168129409286145': 'Peu'
};

class UserNicknames {
    /**
     * Obter apelido de um usuário por ID
     * Retorna o apelido conhecido ou "random" para desconhecidos
     */
    static getNickname(userId) {
        return KNOWN_USERS[userId] || 'random';
    }
    
    /**
     * Verificar se um usuário é conhecido
     */
    static isKnownUser(userId) {
        return userId in KNOWN_USERS;
    }
    
    /**
     * Obter todos os usuários conhecidos
     */
    static getKnownUsers() {
        return { ...KNOWN_USERS };
    }
    
    /**
     * Obter lista de apelidos
     */
    static getAllNicknames() {
        return Object.values(KNOWN_USERS);
    }
    
    /**
     * Obter User ID por apelido
     */
    static getUserIdByNickname(nickname) {
        for (const [userId, nick] of Object.entries(KNOWN_USERS)) {
            if (nick.toLowerCase() === nickname.toLowerCase()) {
                return userId;
            }
        }
        return null;
    }
    
    /**
     * Adicionar novo usuário conhecido (runtime)
     */
    static addKnownUser(userId, nickname) {
        KNOWN_USERS[userId] = nickname;
        console.log(`[NICKNAMES] Adicionado: ${nickname} (${userId})`);
    }
    
    /**
     * Remover usuário conhecido (runtime)
     */
    static removeKnownUser(userId) {
        const nickname = KNOWN_USERS[userId];
        if (nickname) {
            delete KNOWN_USERS[userId];
            console.log(`[NICKNAMES] Removido: ${nickname} (${userId})`);
            return true;
        }
        return false;
    }
    
    /**
     * Obter informações completas do usuário
     */
    static getUserInfo(userId) {
        return {
            userId: userId,
            nickname: this.getNickname(userId),
            isKnown: this.isKnownUser(userId)
        };
    }
}

module.exports = UserNicknames;

