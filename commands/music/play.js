const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca música do Spotify, YouTube, SoundCloud ou busca por nome')
        .addStringOption(option =>
            option.setName('musica')
                .setDescription('URL ou nome da música')
                .setRequired(true)),

    async execute(interaction) {
        // Defer IMEDIATAMENTE ANTES de importar qualquer coisa pesada
        await interaction.deferReply();

        // Lazy load - só carrega quando precisa
        const QueueManager = require('../../music/QueueManager');
        const MusicProcessor = require('../../music/MusicProcessor');
        const MusicPlayer = require('../../music/MusicPlayer');
        const { detectPlatform } = require('../../music/PlatformDetector');

        const query = interaction.options.getString('musica');
        const voiceChannel = interaction.member.voice.channel;
        
        // Verificar se o usuário está em um canal de voz
        if (!voiceChannel) {
            return await interaction.editReply({
                content: '❌ Você precisa estar em um canal de voz para usar este comando!'
            });
        }

        // Verificar permissões do bot
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return await interaction.editReply({
                content: '❌ Não tenho permissão para entrar ou falar neste canal de voz!'
            });
        }

        try {
            // Detectar plataforma
            const platform = detectPlatform(query);
            console.log(`🎵 Plataforma detectada: ${platform}`);

            // Processar música
            const songInfo = await MusicProcessor.processSong(query, platform);
            
            // Obter ou criar fila
            let queue = QueueManager.get(interaction.guild.id);
            
            if (!queue) {
                // Criar nova fila
                queue = QueueManager.create(interaction.guild.id, interaction.channel, voiceChannel);
                
                // Adicionar música à fila
                queue.addSong(songInfo);
                
                // Começar a tocar
                const success = await MusicPlayer.playSong(queue);
                
                if (!success) {
                    await interaction.editReply('❌ Erro ao iniciar reprodução!');
                    QueueManager.delete(interaction.guild.id);
                    return;
                }
                
                await interaction.editReply(`🎵 Tocando agora: **${songInfo.title}** por ${songInfo.artist}`);
            } else {
                // Adicionar à fila existente
                queue.addSong(songInfo);
                
                const embed = new EmbedBuilder()
                    .setTitle('✅ Adicionado à Fila')
                    .setDescription(`**${songInfo.title}**\n${songInfo.artist}`)
                    .setThumbnail(songInfo.thumbnail)
                    .setColor(0x2ed573)
                    .addFields(
                        { name: 'Posição na Fila', value: `#${queue.songs.length + 1}`, inline: true },
                        { name: 'Plataforma', value: songInfo.platform.toUpperCase(), inline: true }
                    );
                
                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Erro no comando play:', error);
            await interaction.editReply({
                content: `❌ Erro ao processar música: ${error.message}`
            });
        }
    }
};
