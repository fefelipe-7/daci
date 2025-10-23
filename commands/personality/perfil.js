const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserPersonality = require('../../models/UserPersonality');
const PersonalityEngine = require('../../core/PersonalityEngine');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Visualizar perfil de personalidade de um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para visualizar (deixe vazio para ver o seu)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        
        try {
            // Buscar perfil
            const perfil = UserPersonality.get(targetUser.id, interaction.guild.id);
            
            // Atualizar username se necessário
            if (perfil.username === 'Unknown') {
                UserPersonality.update(targetUser.id, interaction.guild.id, { username: targetUser.username });
                perfil.username = targetUser.username;
            }

            // Processar perfil para obter tipo de relação
            const { tipoRelacao } = PersonalityEngine.processarPerfil(perfil);

            // Traduzir tipo de relação
            const traducaoRelacao = {
                'rival_amigavel': '🤝😈 Rival Amigável',
                'protetor': '🛡️💕 Protetor',
                'amigavel_provocador': '😄😏 Amigável Provocador',
                'amigavel': '😊👍 Amigável',
                'rival': '⚔️ Rival',
                'distante': '🌫️ Distante',
                'neutro': '😐 Neutro'
            };

            // Criar embed
            const embed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle(`📊 Perfil de Personalidade`)
                .setDescription(`**${targetUser.username}** - ${traducaoRelacao[tipoRelacao] || 'Neutro'}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '🎭 Extroversão', value: this.gerarBarra(perfil.extroversao), inline: true },
                    { name: '😏 Sarcasmo', value: this.gerarBarra(perfil.sarcasmo), inline: true },
                    { name: '🌸 Sensibilidade', value: this.gerarBarra(perfil.sensibilidade), inline: true },
                    
                    { name: '👑 Liderança', value: this.gerarBarra(perfil.lideranca), inline: true },
                    { name: '💖 Afinidade', value: this.gerarBarra(perfil.afinidade), inline: true },
                    { name: '⚡ Espontaneidade', value: this.gerarBarra(perfil.espontaneidade), inline: true },
                    
                    { name: '🧘 Paciência', value: this.gerarBarra(perfil.paciencia), inline: true },
                    { name: '🎨 Criatividade', value: this.gerarBarra(perfil.criatividade), inline: true },
                    { name: '🖤 Humor Negro', value: this.gerarBarra(perfil.humor_negro), inline: true },
                    
                    { name: '💝 Empatia', value: this.gerarBarra(perfil.empatia), inline: true },
                    { name: '🎉 Zoeira Geral', value: this.gerarBarra(perfil.zoeira_geral), inline: true },
                    { name: '🤝 Lealdade', value: this.gerarBarra(perfil.lealdade), inline: true },
                    
                    { name: '💪 Dominância', value: this.gerarBarra(perfil.dominancia), inline: true },
                    { name: '✨ Autoestima', value: this.gerarBarra(perfil.autoestima), inline: true },
                    { name: '🔍 Curiosidade', value: this.gerarBarra(perfil.curiosidade), inline: true }
                )
                .addFields(
                    { name: '📈 Interações via Menção', value: perfil.interaction_count.toString(), inline: true },
                    { name: '📅 Perfil Criado', value: new Date(perfil.created_at).toLocaleDateString('pt-BR'), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Mencione o bot para ele interagir com você!' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            await interaction.editReply({
                content: '❌ Erro ao buscar perfil de personalidade!',
                flags: 64
            });
        }
    },

    // Helper para gerar barra visual
    gerarBarra(valor) {
        const total = 10;
        const preenchido = Math.round(valor * total);
        const vazio = total - preenchido;
        return '█'.repeat(preenchido) + '░'.repeat(vazio) + ` ${(valor * 100).toFixed(0)}%`;
    }
};

