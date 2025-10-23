const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila completa de músicas')
        .addIntegerOption(option =>
            option.setName('pagina')
                .setDescription('Número da página')
                .setMinValue(1)
                .setRequired(false)),

    async execute(interaction) {
        const queue = QueueManager.get(interaction.guild.id);

        if (!queue || (!queue.currentSong && queue.songs.length === 0)) {
            return await interaction.reply({
                content: '❌ A fila está vazia!',
                ephemeral: true
            });
        }

        const page = interaction.options.getInteger('pagina') || 1;
        const songsPerPage = 10;
        const start = (page - 1) * songsPerPage;
        const end = start + songsPerPage;
        
        const totalPages = Math.ceil(queue.songs.length / songsPerPage);

        if (page > totalPages && totalPages > 0) {
            return await interaction.reply({
                content: `❌ Página inválida! Total de páginas: ${totalPages}`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('📋 Fila de Músicas')
            .setColor(0x1db954);

        // Música atual
        if (queue.currentSong) {
            const formatDuration = (seconds) => {
                if (!seconds) return '00:00';
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${mins}:${secs.toString().padStart(2, '0')}`;
            };

            embed.addFields({
                name: '🎵 Tocando Agora',
                value: `**${queue.currentSong.title}**\n${queue.currentSong.artist} • ${formatDuration(queue.currentSong.duration)}`,
                inline: false
            });
        }

        // Próximas músicas
        if (queue.songs.length > 0) {
            const queueList = queue.songs
                .slice(start, end)
                .map((song, index) => {
                    const position = start + index + 1;
                    return `**${position}.** ${song.title}\n${song.artist}`;
                })
                .join('\n\n');

            embed.addFields({
                name: `📝 Próximas (${queue.songs.length} na fila)`,
                value: queueList || 'Nenhuma música na fila',
                inline: false
            });
        }

        // Status
        const statusParts = [];
        if (queue.loop) statusParts.push('🔁 Loop: Música');
        if (queue.loopQueue) statusParts.push('🔁 Loop: Fila');
        if (queue.shuffle) statusParts.push('🔀 Shuffle: Ativo');
        statusParts.push(`🔊 Volume: ${queue.volume}%`);

        embed.addFields({
            name: '⚙️ Status',
            value: statusParts.join(' | '),
            inline: false
        });

        if (totalPages > 1) {
            embed.setFooter({ text: `Página ${page}/${totalPages} • Total: ${queue.songs.length} música(s)` });
        } else {
            embed.setFooter({ text: `Total: ${queue.songs.length} música(s) na fila` });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
