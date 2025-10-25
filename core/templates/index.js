/**
 * Interface Unificada de Templates de Mensagens
 * 
 * Agrega todos os templates em um único ponto de acesso,
 * mantendo compatibilidade total com o código existente.
 */

const GreetingsTemplates = require('./GreetingsTemplates');
const EmotionalTemplates = require('./EmotionalTemplates');
const OffensiveTemplates = require('./OffensiveTemplates');
const QuestionsTemplates = require('./QuestionsTemplates');
const SurpriseAndHelpTemplates = require('./SurpriseAndHelpTemplates');
const SystemMessagesTemplates = require('./SystemMessagesTemplates');

/**
 * Objeto unificado com todos os templates
 * Compatível com o formato antigo de MessageTemplates_EXPANDED.js
 */
const MENSAGENS_EXPANDIDAS = {
    // Templates de Saudações e Social
    saudacao: GreetingsTemplates.saudacao,
    despedida: GreetingsTemplates.despedida,
    agradecer: GreetingsTemplates.agradecer,
    receber_agradecimento: GreetingsTemplates.receber_agradecimento,

    // Templates Emocionais
    elogio: EmotionalTemplates.elogio,
    comemoracao: EmotionalTemplates.comemoracao,
    frustracao: EmotionalTemplates.frustracao,
    aprovacao: EmotionalTemplates.aprovacao,

    // Templates de Ofensa e Zoação
    ofensa: OffensiveTemplates.ofensa,
    zoacao: OffensiveTemplates.zoacao,

    // Templates de Perguntas
    pergunta: QuestionsTemplates.pergunta,
    concordar: QuestionsTemplates.concordar,
    discordar: QuestionsTemplates.discordar,

    // Templates de Surpresa e Ajuda
    surpresa: SurpriseAndHelpTemplates.surpresa,
    ajuda: SurpriseAndHelpTemplates.ajuda,

    // Templates de Sistema
    erro: SystemMessagesTemplates.erro,
    confusao: SystemMessagesTemplates.confusao,
    espera: SystemMessagesTemplates.espera,
    impaciencia: SystemMessagesTemplates.impaciencia,
    casual: SystemMessagesTemplates.casual,
    fallback: SystemMessagesTemplates.fallback
};

module.exports = MENSAGENS_EXPANDIDAS;

