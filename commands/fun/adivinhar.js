const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adivinhar')
        .setDescription('Jogo de adivinhar número de 1 a 10')
        .addIntegerOption(option =>
            option.setName('numero')
                .setDescription('Seu palpite (1-10)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(true)),

    async execute(interaction) {
        const userGuess = interaction.options.getInteger('numero');
        const correctNumber = Math.floor(Math.random() * 10) + 1;
        
        const isCorrect = userGuess === correctNumber;
        
        const embed = new EmbedBuilder()
            .setTitle('🎯 Jogo de Adivinhar')
            .setColor(isCorrect ? 0x2ed573 : 0xff4757)
            .addFields(
                { name: 'Seu palpite', value: `${userGuess}`, inline: true },
                { name: 'Número correto', value: `${correctNumber}`, inline: true },
                { name: 'Resultado', value: isCorrect ? '🎉 Parabéns! Você acertou!' : '😔 Que pena! Tente novamente!', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: "Jogo interno do grupo!" });

        await interaction.reply({ embeds: [embed] });
    }
};
