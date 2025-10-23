const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');
const MusicPlayer = require('../../music/MusicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Pula a música atual (votação se >2 pessoas no canal)'),

    async execute(interaction) {
        const queue = QueueManager.get(interaction.guild.id);

        if (!queue || !queue.playing) {
            return await interaction.reply({
                content: '❌ Não há nada tocando no momento!',
                ephemeral: true
            });
        }

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return await interaction.reply({
                content: '❌ Você precisa estar no canal de voz para pular!',
                ephemeral: true
            });
        }

        if (voiceChannel.id !== queue.voiceChannel.id) {
            return await interaction.reply({
                content: '❌ Você precisa estar no mesmo canal de voz que eu!',
                ephemeral: true
            });
        }

        // Contar membros (sem bots)
        const members = voiceChannel.members.filter(m => !m.user.bot);
        const membersCount = members.size;

        // Se apenas 1-2 pessoas, skip direto
        if (membersCount <= 2) {
            MusicPlayer.skip(queue);
            
            const embed = new EmbedBuilder()
                .setTitle('⏭️ Música Pulada')
                .setDescription(`Pulando **${queue.currentSong.title}**`)
                .setColor(0xffa502);

            return await interaction.reply({ embeds: [embed] });
        }

        // Sistema de votação (mais de 2 pessoas)
        queue.skipVotes.add(interaction.user.id);
        const votesNeeded = Math.ceil(membersCount / 2);

        if (queue.skipVotes.size >= votesNeeded) {
            // Votos suficientes, pular
            MusicPlayer.skip(queue);
            
            const embed = new EmbedBuilder()
                .setTitle('⏭️ Música Pulada')
                .setDescription(`Pulando **${queue.currentSong.title}**\n\nVotos: ${queue.skipVotes.size}/${votesNeeded}`)
                .setColor(0x2ed573);

            return await interaction.reply({ embeds: [embed] });
        } else {
            // Ainda precisa de mais votos
            const embed = new EmbedBuilder()
                .setTitle('🗳️ Voto Registrado')
                .setDescription(`Vote para pular **${queue.currentSong.title}**\n\nVotos: ${queue.skipVotes.size}/${votesNeeded}`)
                .setColor(0xffa502);

            return await interaction.reply({ embeds: [embed] });
        }
    }
};

