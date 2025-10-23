const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Mostra a música que está tocando agora'),

    async execute(interaction) {
        const queue = QueueManager.get(interaction.guild.id);

        if (!queue || !queue.currentSong) {
            return await interaction.reply({
                content: '❌ Não há nada tocando no momento!',
                ephemeral: true
            });
        }

        const song = queue.currentSong;

        const formatDuration = (seconds) => {
            if (!seconds) return '00:00';
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            if (hours > 0) {
                return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        const platformEmoji = {
            'spotify': '🎵 Spotify',
            'youtube': '▶️ YouTube',
            'soundcloud': '🔊 SoundCloud'
        };

        const embed = new EmbedBuilder()
            .setTitle('🎵 Tocando Agora')
            .setDescription(`**${song.title}**\n${song.artist}`)
            .setThumbnail(song.thumbnail)
            .setColor(0x1db954)
            .addFields(
                { name: 'Duração', value: formatDuration(song.duration), inline: true },
                { name: 'Plataforma', value: platformEmoji[song.platform] || song.platform, inline: true },
                { name: 'Volume', value: `${queue.volume}%`, inline: true }
            );

        // Adicionar informações de loop
        if (queue.loop) {
            embed.addFields({ name: '🔁 Loop', value: 'Música atual', inline: true });
        } else if (queue.loopQueue) {
            embed.addFields({ name: '🔁 Loop', value: 'Fila inteira', inline: true });
        }

        // Adicionar link original
        if (song.originalUrl) {
            embed.addFields({ 
                name: '🔗 Link', 
                value: `[Abrir ${song.platform}](${song.originalUrl})`, 
                inline: true 
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
