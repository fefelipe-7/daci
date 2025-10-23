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

        // Ignorar mensagens que não mencionam o bot
        if (!message.mentions.has(message.client.user)) return;

        try {
            // 1. Carregar perfil do usuário (criar se não existe)
            let perfil = UserPersonality.get(message.author.id, message.guild.id);
            
            // DEBUG: Verificar reconhecimento de apelido
            const apelidoDetectado = UserNicknames.getNickname(message.author.id);
            console.log(`[NICKNAME DEBUG] User ID: ${message.author.id} | Username: ${message.author.username} | Apelido Detectado: ${apelidoDetectado}`);
            
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

            // 4. Gerar resposta usando templates (passa userId para sistema de apelidos)
            const resposta = ResponseBuilder.gerarRespostaTemplate(
                mensagemLimpa,
                parametrosFinais,
                estiloResposta,
                message.author.username,
                message.author.id  // Passa userId para reconhecimento de apelidos
            );

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
            console.log(`[PERSONALITY] Respondeu para ${apelidoDetectado} | Tipo: ${tipoRelacao} | Tom: ${estiloResposta.tom}`);

        } catch (error) {
            console.error('[PERSONALITY] Erro ao processar menção:', error);
            
            // Resposta de fallback em caso de erro
            try {
                await message.reply('Hmm... algo deu errado aqui 🤔');
            } catch (replyError) {
                console.error('[PERSONALITY] Erro ao enviar resposta de fallback:', replyError);
            }
        }
    }
};

