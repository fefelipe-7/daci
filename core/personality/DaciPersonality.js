/**
 * DaciPersonality - Interface Unificada da Personalidade
 * 
 * Agrega todos os módulos de personalidade em um único ponto de acesso
 * Mantém compatibilidade total com o código existente
 */

const { DACI_IDENTITY } = require('./BehaviorRules');
const { VOCABULARIO, ABREVIACOES } = require('./VocabularyData');
const { EMOJIS, ALONGAMENTOS, RISADAS } = require('./EmojisData');
const { APELIDOS } = require('./NicknamesData');

module.exports = {
    // Comportamento e identidade
    DACI_IDENTITY,
    
    // Vocabulário
    VOCABULARIO,
    ABREVIACOES,
    
    // Emojis e expressões
    EMOJIS,
    ALONGAMENTOS,
    RISADAS,
    
    // Apelidos
    APELIDOS
};

