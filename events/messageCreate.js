const UserPersonality = require('../models/UserPersonality');
const PersonalityEngine = require('../core/PersonalityEngine');
const ResponseBuilder = require('../core/ResponseBuilder');
const UserNicknames = require('../core/UserNicknames');
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
                console.error('[IA] Erro ao verificar mensagem referenciada:', error);
            }
        }

        // Ignorar se não for menção nem resposta ao bot
        if (!isMention && !isReplyingToBot) return;

        try {
            // 1. Carregar perfil do usuário (criar se não existe)
            let perfil = UserPersonality.get(message.author.id, message.guild.id);
            
            // DEBUG: Verificar reconhecimento de apelido
            const apelidoDetectado = UserNicknames.getNickname(message.author.id);
            console.log(`[IA] User ID: ${message.author.id} | Username: ${message.author.username} | Apelido: ${apelidoDetectado}`);
            
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
            if (global.aiService) {
                try {
                    console.log(`[IA] Gerando resposta com IA para ${apelidoDetectado}...`);
                    
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

                    console.log(`[IA] ✅ Resposta gerada com IA`);

                } catch (error) {
                    console.warn(`[IA] ⚠️ Falha na IA, usando fallback: ${error.message}`);
                    
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
                console.log(`[IA] ℹ️ IA desabilitada, usando templates`);
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

            // Log para console (usa apelido detectado)
            console.log(`[IA] Respondeu para ${apelidoDetectado} | Tipo: ${tipoRelacao} | Tom: ${estiloResposta.tom}`);

        } catch (error) {
            console.error('[IA] Erro ao processar mensagem:', error);
            
            // Resposta de fallback em caso de erro
            try {
                await message.reply('Hmm... algo deu errado aqui 🤔');
            } catch (replyError) {
                console.error('[IA] Erro ao enviar resposta de fallback:', replyError);
            }
        }
    }
};

