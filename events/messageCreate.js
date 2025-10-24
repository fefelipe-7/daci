/**
 * MessageCreate Event - Orquestrador principal das 3 camadas
 * Preprocessor → Processor → Postprocessor
 */

const Preprocessor = require('../core/Preprocessor');
const Processor = require('../core/Processor');
const Postprocessor = require('../core/Postprocessor');
const UserPersonality = require('../models/UserPersonality');
const UserNicknames = require('../core/UserNicknames');
const logger = require('../core/Logger');
const database = require('../database/database');
const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'personality_interactions.log');

// Instanciar as três camadas
let preprocessor = null;
let processor = null;
let postprocessor = null;

// Inicializar camadas quando houver API key
function initializeLayers() {
    if (!preprocessor) {
        preprocessor = new Preprocessor();
    }
    
    if (!processor && process.env.OPENROUTE_KEY) {
        processor = new Processor(process.env.OPENROUTE_KEY);
    }
    
    if (!postprocessor) {
        postprocessor = new Postprocessor(processor, database);
    }
}

// Helper para escrever log legado (manter compatibilidade)
function logInteractionLegacy(userId, username, mensagem, resposta, parametros, estilo) {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] USER: ${username} (${userId})\nMENSAGEM: ${mensagem}\nRESPOSTA: ${resposta}\nPARAMETROS: sarcasmo=${parametros.sarcasmo.toFixed(2)}, afinidade=${parametros.afinidade.toFixed(2)}, empatia=${parametros.empatia.toFixed(2)}\nESTILO: ${estilo.tom} (provocacao: ${estilo.provocacao})\n${'='.repeat(80)}\n`;
        
        fs.appendFileSync(logFile, logEntry, 'utf8');
    } catch (error) {
        logger.error('message', 'Erro ao escrever log legado', error);
    }
}

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignorar mensagens de bots
        if (message.author.bot) return;

        // Verificar se é menção ao bot OU resposta a uma mensagem do bot
        const isMention = message.mentions.has(message.client.user);
        const isReplyToBot = message.reference && message.reference.messageId;
        
        let isReplyingToBot = false;
        if (isReplyToBot) {
            try {
                const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                isReplyingToBot = repliedMessage.author.id === message.client.user.id;
            } catch (error) {
                logger.error('message', 'Erro ao verificar mensagem referenciada', error);
            }
        }

        // Ignorar se não for menção nem resposta ao bot
        if (!isMention && !isReplyingToBot) return;

        // Inicializar camadas se necessário
        initializeLayers();

        try {
            // Log da mensagem recebida
            logger.messageReceived(
                message.author.id,
                message.author.username,
                message.content,
                isMention,
                isReplyingToBot
            );

            const apelidoDetectado = UserNicknames.getNickname(message.author.id);
            
            // ============================================================
            // NOVA ARQUITETURA: 3 CAMADAS
            // ============================================================
            
            let resposta;
            let finalResponse;
            
            if (processor && preprocessor && postprocessor) {
                // USAR NOVA ARQUITETURA
                logger.info('message', '🔄 Usando arquitetura de 3 camadas');
                
                try {
                    // 1. PREPROCESSAR
                    logger.debug('message', '1️⃣ Preprocessando...');
                    const pkg = await preprocessor.process(message, {
                        user: message.author,
                        channel: message.channel,
                        guild: message.guild
                    });
                    
                    // 2. PROCESSAR (IA)
                    logger.debug('message', '2️⃣ Processando com IA...');
                    let rawResponse = null;
                    
                    try {
                        logger.aiRequest(apelidoDetectado, pkg.prompt.user.substring(0, 100), 'auto-select');
                        rawResponse = await processor.process(pkg);
                        logger.aiResponse(apelidoDetectado, rawResponse.metrics.responseTime, true);
                    } catch (error) {
                        logger.warn('message', `IA falhou: ${error.message}`);
                        logger.aiResponse(apelidoDetectado, 0, false);
                        // rawResponse permanece null, Postprocessor vai usar fallback
                    }
                    
                    // 3. POSTPROCESSAR
                    logger.debug('message', '3️⃣ Postprocessando...');
                    finalResponse = await postprocessor.process(rawResponse, pkg);
                    
                    resposta = finalResponse.content;
                    
                    // Log do resultado
                    if (finalResponse.fallbackLevel > 0) {
                        logger.warn('message', `Usou fallback nível ${finalResponse.fallbackLevel}`);
                    } else {
                        logger.success('message', `Resposta gerada com sucesso (score: ${finalResponse.metrics.styleScore?.toFixed(2) || 'N/A'})`);
                    }
                    
                    // Log legado para compatibilidade
                    const personality = pkg.metadata.personality;
                    logInteractionLegacy(
                        message.author.id,
                        message.author.username,
                        pkg.prompt.user,
                        resposta,
                        personality.parametrosFinais,
                        personality.estiloResposta
                    );
                    
                } catch (error) {
                    logger.error('message', 'Erro na arquitetura de 3 camadas, usando fallback de emergência', error);
                    resposta = 'pô, deu um erro aqui, desculpa 😅';
                }
                
            } else {
                // FALLBACK: USAR SISTEMA LEGADO SE CAMADAS NÃO DISPONÍVEIS
                logger.warn('message', '⚠️ Camadas não disponíveis, usando sistema legado');
                
                const ResponseBuilder = require('../core/ResponseBuilder');
                const PersonalityEngine = require('../core/PersonalityEngine');
                
                // Carregar perfil
                let perfil = UserPersonality.get(message.author.id, message.guild.id);
                
                logger.personalityLoaded(
                    message.author.id,
                    message.author.username,
                    apelidoDetectado,
                    perfil.parametros?.afinidade || 0.5
                );
                
                // Atualizar username se necessário
                if (perfil.username === 'Unknown') {
                    UserPersonality.update(message.author.id, message.guild.id, { 
                        username: message.author.username 
                    });
                    perfil.username = message.author.username;
                }

                // Calcular personalidade
                const { parametrosFinais, tipoRelacao, estiloResposta } = PersonalityEngine.processarPerfil(perfil);

                // Limpar mensagem
                const mensagemLimpa = message.content
                    .replace(/<@!?\d+>/g, '')
                    .trim();

                // Gerar resposta com templates
                resposta = ResponseBuilder.gerarRespostaTemplate(
                    mensagemLimpa,
                    parametrosFinais,
                    estiloResposta,
                    message.author.username,
                    message.author.id
                );
                
                // Log legado
                logInteractionLegacy(
                    message.author.id,
                    message.author.username,
                    mensagemLimpa,
                    resposta,
                    parametrosFinais,
                    estiloResposta
                );
            }

            // Incrementar contador de interações
            UserPersonality.incrementInteraction(message.author.id, message.guild.id);

            // Enviar resposta
            await message.reply(resposta);

            // Log da resposta enviada
            logger.success('message', `Respondeu: "${resposta.substring(0, 50)}${resposta.length > 50 ? '...' : ''}"`);

        } catch (error) {
            logger.error('message', 'Erro crítico ao processar mensagem', error);
            
            // Resposta de fallback de emergência
            try {
                await message.reply('Hmm... algo deu errado aqui 🤔');
            } catch (replyError) {
                logger.error('message', 'Erro ao enviar resposta de emergência', replyError);
            }
        }
    }
};
