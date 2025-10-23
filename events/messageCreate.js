const UserPersonality = require('../models/UserPersonality');
const PersonalityEngine = require('../core/PersonalityEngine');
const ResponseBuilder = require('../core/ResponseBuilder');
const UserNicknames = require('../core/UserNicknames');
const logger = require('../core/Logger');
const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'personality_interactions.log');

// Helper para escrever log
function logInteraction(userId, username, mensagem, resposta, parametros, estilo) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] USER: ${username} (${userId})\nMENSAGEM: ${mensagem}\nRESPOSTA: ${resposta}\nPARAMETROS: sarcasmo=${parametros.sarcasmo.toFixed(2)}, afinidade=${parametros.afinidade.toFixed(2)}, empatia=${parametros.empatia.toFixed(2)}\nESTILO: ${estilo.tom} (provocacao: ${estilo.provocacao})\n${'='.repeat(80)}\n`;
    
    fs.appendFileSync(logFile, logEntry, 'utf8');
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

        try {
            // Log da mensagem recebida
            logger.messageReceived(
                message.author.id,
                message.author.username,
                message.content,
                isMention,
                isReplyingToBot
            );

            // 1. Carregar perfil do usuário (criar se não existe)
            let perfil = UserPersonality.get(message.author.id, message.guild.id);
            
            // DEBUG: Verificar reconhecimento de apelido
            const apelidoDetectado = UserNicknames.getNickname(message.author.id);
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

            // 2. Calcular personalidade composta
            const { parametrosFinais, tipoRelacao, estiloResposta } = PersonalityEngine.processarPerfil(perfil);

            // 3. Remover menção do bot da mensagem para análise
            const mensagemLimpa = message.content
                .replace(/<@!?\d+>/g, '')
                .trim();

            let resposta;

            // 4. TENTAR GERAR RESPOSTA COM IA (se disponível)
            const startTime = Date.now();
            if (global.aiService) {
                try {
                    logger.aiRequest(apelidoDetectado, mensagemLimpa, 'auto-select');
                    
                    // Contexto adicional da conversa
                    const context = {
                        channelType: message.channel.type,
                        username: message.author.username,
                        isMention: isMention,
                        isReply: isReplyingToBot,
                        tipoRelacao: tipoRelacao
                    };

                    // Gerar resposta com IA
                    resposta = await global.aiService.generateResponse(
                        mensagemLimpa,
                        perfil,
                        context
                    );

                    const responseTime = Date.now() - startTime;
                    logger.aiResponse(apelidoDetectado, responseTime, true);
                    logger.performance('Geração IA', responseTime);

                } catch (error) {
                    const responseTime = Date.now() - startTime;
                    logger.warn('ai', `Falha na IA para ${apelidoDetectado}, usando fallback: ${error.message}`);
                    logger.aiResponse(apelidoDetectado, responseTime, false);
                    
                    // FALLBACK: usar templates se IA falhar
                    resposta = ResponseBuilder.gerarRespostaTemplate(
                        mensagemLimpa,
                        parametrosFinais,
                        estiloResposta,
                        message.author.username,
                        message.author.id
                    );
                }
            } else {
                // IA não disponível - usar templates
                logger.info('ai', 'IA desabilitada, usando templates');
                resposta = ResponseBuilder.gerarRespostaTemplate(
                    mensagemLimpa,
                    parametrosFinais,
                    estiloResposta,
                    message.author.username,
                    message.author.id
                );
            }

            // 5. Incrementar contador de interações
            UserPersonality.incrementInteraction(message.author.id, message.guild.id);

            // 6. Registrar no log
            logInteraction(
                message.author.id,
                message.author.username,
                mensagemLimpa,
                resposta,
                parametrosFinais,
                estiloResposta
            );

            // 7. Enviar resposta
            await message.reply(resposta);

            // Log da resposta enviada
            logger.personalityResponse(apelidoDetectado, tipoRelacao, estiloResposta.tom);
            logger.success('message', `Respondeu: "${resposta.substring(0, 50)}${resposta.length > 50 ? '...' : ''}"`);

        } catch (error) {
            logger.error('message', 'Erro ao processar mensagem', error);
            
            // Resposta de fallback em caso de erro
            try {
                await message.reply('Hmm... algo deu errado aqui 🤔');
            } catch (replyError) {
                logger.error('message', 'Erro ao enviar resposta de fallback', replyError);
            }
        }
    }
};

