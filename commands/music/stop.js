const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');
const MusicPlayer = require('../../music/MusicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para toda a reprodução e limpa a fila'),

    async execute(interaction) {
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

        MusicPlayer.stop(queue);
        
        const embed = new EmbedBuilder()
            .setTitle('⏹️ Música Parada')
            .setDescription('Toda a reprodução foi parada e a fila foi limpa!')
            .setColor(0xff4757);

        await interaction.reply({ embeds: [embed] });
    }
};
