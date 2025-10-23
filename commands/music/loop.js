const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../../music/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Ativa/desativa loop')
        .addStringOption(option =>
            option.setName('modo')
                .setDescription('Modo de loop')
                .addChoices(
                    { name: 'Off - Desativar loop', value: 'off' },
                    { name: 'Song - Loop música atual', value: 'song' },
                    { name: 'Queue - Loop fila inteira', value: 'queue' }
                )
                .setRequired(true)),

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

        const mode = interaction.options.getString('modo');

        let description;
        
        switch (mode) {
            case 'off':
                queue.loop = false;
                queue.loopQueue = false;
                description = 'Loop desativado';
                break;
            case 'song':
                queue.loop = true;
                queue.loopQueue = false;
                description = '🔁 Loop ativado para música atual';
                break;
            case 'queue':
                queue.loop = false;
                queue.loopQueue = true;
                description = '🔁 Loop ativado para fila inteira';
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle('🔁 Loop')
            .setDescription(description)
            .setColor(0x7289da);

        await interaction.reply({ embeds: [embed] });
    }
};

