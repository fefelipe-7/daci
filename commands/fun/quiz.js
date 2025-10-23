const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Pergunta aleatória sobre o grupo ou piadas internas'),

    async execute(interaction) {
        // Perguntas internas sobre o grupo
        const quizzes = [
            {
                question: "Quem é o dono do servidor?",
                options: ["Lawliet", "Loritta", "ZeroTwo", "Jockei Music"],
                correct: 0,
                explanation: "Lawliet é o dono do servidor! 👑"
            },
            {
                question: "Qual bot tocava música antes?",
                options: ["Lawliet", "Loritta", "Jockei Music", "Mudae"],
                correct: 2,
                explanation: "Jockei Music era o bot de música! 🎵"
            },
            {
                question: "Qual bot fazia gacha/colecionáveis?",
                options: ["Lawliet", "Loritta", "ZeroTwo", "Mudae"],
                correct: 3,
                explanation: "Mudae era o bot de gacha! 🎲"
            },
            {
                question: "Qual bot fazia moderação?",
                options: ["Lawliet", "Loritta", "ZeroTwo", "Jockei Music"],
                correct: 0,
                explanation: "Lawliet fazia a moderação! 🛡️"
            },
            {
                question: "Qual bot fazia memes e diversão?",
                options: ["Lawliet", "Loritta", "ZeroTwo", "Mudae"],
                correct: 1,
                explanation: "Loritta fazia memes e diversão! 🎉"
            },
            {
                question: "Quantos bots o grupo tinha antes?",
                options: ["3", "4", "5", "6"],
                correct: 2,
                explanation: "O grupo tinha 5 bots: Lawliet, Loritta, ZeroTwo, Jockei Music e Mudae! 🤖"
            },
            {
                question: "Qual é a piada interna mais famosa do grupo?",
                options: ["Lawliet quebra o servidor", "Loritta explica demais", "ZeroTwo é fofo", "Todas as anteriores"],
                correct: 3,
                explanation: "Todas são piadas internas famosas! 😂"
            }
        ];

        const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🧠 Quiz do Grupo')
            .setDescription(`**${randomQuiz.question}**`)
            .setColor(0xffa502)
            .addFields(
                { name: 'A)', value: randomQuiz.options[0], inline: true },
                { name: 'B)', value: randomQuiz.options[1], inline: true },
                { name: 'C)', value: randomQuiz.options[2], inline: true },
                { name: 'D)', value: randomQuiz.options[3], inline: true }
            )
            .setFooter({ text: "Resposta em 10 segundos..." })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Aguardar 10 segundos e mostrar resposta
        setTimeout(async () => {
            const answerLetters = ['A', 'B', 'C', 'D'];
            const correctAnswer = answerLetters[randomQuiz.correct];
            
            const answerEmbed = new EmbedBuilder()
                .setTitle('✅ Resposta do Quiz')
                .setDescription(`**Resposta correta: ${correctAnswer}) ${randomQuiz.options[randomQuiz.correct]}**\n\n${randomQuiz.explanation}`)
                .setColor(0x2ed573)
                .setTimestamp();

            await interaction.followUp({ embeds: [answerEmbed] });
        }, 10000);
    }
};
