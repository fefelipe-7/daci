const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');
const MusicPlayer = require('../../music/MusicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Retoma a música pausada'),

    async execute(interaction) {
        const queue = QueueManager.get(interaction.guild.id);

        if (!queue) {
            return await interaction.reply({
                content: '❌ Não há nada pausado no momento!',
                ephemeral: true
            });
        }

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== queue.voiceChannel.id) {
            return await interaction.reply({
                content: '❌ Você precisa estar no mesmo canal de voz que eu!',
                ephemeral: true
            });
        }

        if (queue.playing) {
            return await interaction.reply({
                content: '❌ A música já está tocando!',
                ephemeral: true
            });
        }

        MusicPlayer.resume(queue);

        const embed = new EmbedBuilder()
            .setTitle('▶️ Música Retomada')
            .setDescription(`**${queue.currentSong.title}** foi retomada`)
            .setColor(0x2ed573);

        await interaction.reply({ embeds: [embed] });
    }
};
