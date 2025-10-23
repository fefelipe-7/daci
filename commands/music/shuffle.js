const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Embaralha a fila de músicas'),

    async execute(interaction) {
        const queue = QueueManager.get(interaction.guild.id);

        if (!queue) {
            return await interaction.reply({
                content: '❌ Não há nada tocando no momento!',
                ephemeral: true
            });
        }

        if (queue.songs.length < 2) {
            return await interaction.reply({
                content: '❌ Não há músicas suficientes na fila para embaralhar!',
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

        // Embaralhar fila
        queue.shuffleQueue();

        const embed = new EmbedBuilder()
            .setTitle('🔀 Fila Embaralhada')
            .setDescription(`${queue.songs.length} música(s) embaralhada(s)!`)
            .setColor(0x9b59b6);

        await interaction.reply({ embeds: [embed] });
    }
};

