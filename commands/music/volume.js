const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');
const MusicPlayer = require('../../music/MusicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Ajusta o volume da música (0-100)')
        .addIntegerOption(option =>
            option.setName('nivel')
                .setDescription('Nível do volume (0-100)')
                .setMinValue(0)
                .setMaxValue(100)
                .setRequired(true)),

    async execute(interaction) {
        const volume = interaction.options.getInteger('nivel');
        const queue = QueueManager.get(interaction.guild.id);

        if (!queue) {
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

        MusicPlayer.setVolume(queue, volume);

        const embed = new EmbedBuilder()
            .setTitle('🔊 Volume Ajustado')
            .setDescription(`Volume definido para **${volume}%**`)
            .setColor(0x1db954);

        await interaction.reply({ embeds: [embed] });
    }
};
