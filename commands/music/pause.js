const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');
const MusicPlayer = require('../../music/MusicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa a música atual'),

    async execute(interaction) {
        const queue = QueueManager.get(interaction.guild.id);

        if (!queue || !queue.playing) {
            return await interaction.reply({
                content: '❌ Não há nada tocando no momento!',
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

        MusicPlayer.pause(queue);

        const embed = new EmbedBuilder()
            .setTitle('⏸️ Música Pausada')
            .setDescription(`**${queue.currentSong.title}** foi pausada`)
            .setColor(0xffa502);

        await interaction.reply({ embeds: [embed] });
    }
};

