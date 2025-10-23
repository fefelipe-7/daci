const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserPersonality = require('../../models/UserPersonality');
const PersonalityEngine = require('../../core/PersonalityEngine');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug_personalidade')
        .setDescription('(ADMIN) Visualizar cálculos internos da personalidade')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para debug')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Verificar se é owner
        const ownerId = process.env.OWNER_ID;
        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: '❌ Apenas o dono do bot pode usar este comando!',
                flags: 64
            });
        }

        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario');

        try {
            // Buscar perfil
            const perfil = UserPersonality.get(targetUser.id, interaction.guild.id);
            
            // Gerar debug info
            const debugInfo = PersonalityEngine.gerarDebugInfo(perfil, targetUser.username);

            // Criar embed de debug
            const embed = new EmbedBuilder()
                .setColor(0xFF6600)
                .setTitle(`🔍 Debug de Personalidade - ${debugInfo.username}`)
                .setDescription('**Análise detalhada do cálculo de personalidade composta**')
                .addFields(
                    { 
                        name: '🤖 Base Bot', 
                        value: `Sarcasmo: ${debugInfo.baseBot.sarcasmo}\nAfinidade: ${debugInfo.baseBot.afinidade}\nHumor Negro: ${debugInfo.baseBot.humor_negro}`,
                        inline: true 
                    },
                    { 
                        name: '👤 Perfil Usuário', 
                        value: `Sarcasmo: ${debugInfo.perfilUser.sarcasmo}\nAfinidade: ${debugInfo.perfilUser.afinidade}\nHumor Negro: ${debugInfo.perfilUser.humor_negro}`,
                        inline: true 
                    },
                    { 
                        name: '⚗️ Fusão Ponderada', 
                        value: `Sarcasmo: ${debugInfo.fusao.sarcasmo}\nAfinidade: ${debugInfo.fusao.afinidade}\nHumor Negro: ${debugInfo.fusao.humor_negro}`,
                        inline: true 
                    },
                    { 
                        name: '🔄 Influências Cruzadas', 
                        value: debugInfo.influencias || 'Nenhuma',
                        inline: false 
                    },
                    { 
                        name: '🎭 Tipo de Relação', 
                        value: this.traduzirTipoRelacao(debugInfo.tipoRelacao),
                        inline: true 
                    },
                    { 
                        name: '💬 Estilo de Resposta', 
                        value: `Tom: **${debugInfo.estiloResposta.tom}**\nProvocação: **${debugInfo.estiloResposta.provocacao}**\nSarcasmo: ${debugInfo.estiloResposta.sarcasmo}`,
                        inline: true 
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'Debug gerado por ' + interaction.user.username });

            await interaction.editReply({ embeds: [embed] });

            // Log para console também
            console.log(`[DEBUG] Respondendo para ${debugInfo.username}`);
            console.log(`├─ Base Bot: sarcasmo=${debugInfo.baseBot.sarcasmo}, afinidade=${debugInfo.baseBot.afinidade}`);
            console.log(`├─ Perfil User: sarcasmo=${debugInfo.perfilUser.sarcasmo}, afinidade=${debugInfo.perfilUser.afinidade}`);
            console.log(`├─ Fusão: sarcasmo=${debugInfo.fusao.sarcasmo}, afinidade=${debugInfo.fusao.afinidade}`);
            console.log(`├─ Influências: ${debugInfo.influencias}`);
            console.log(`└─ Estilo: ${debugInfo.estiloResposta.tom.toUpperCase()} (sarcasmo=${debugInfo.estiloResposta.sarcasmo}, provocacao=${debugInfo.estiloResposta.provocacao})`);

        } catch (error) {
            console.error('Erro ao gerar debug:', error);
            await interaction.editReply({
                content: '❌ Erro ao gerar debug de personalidade!',
                flags: 64
            });
        }
    },

    traduzirTipoRelacao(tipo) {
        const traducoes = {
            'rival_amigavel': '🤝😈 Rival Amigável',
            'protetor': '🛡️💕 Protetor',
            'amigavel_provocador': '😄😏 Amigável Provocador',
            'amigavel': '😊👍 Amigável',
            'rival': '⚔️ Rival',
            'distante': '🌫️ Distante',
            'neutro': '😐 Neutro'
        };
        return traducoes[tipo] || tipo;
    }
};

