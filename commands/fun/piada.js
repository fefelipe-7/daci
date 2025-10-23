const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('piada')
        .setDescription('Envia uma piada interna do grupo'),

    async execute(interaction) {
        // Piadas internas do grupo - personalizadas
        const piadas = [
            {
                setup: "Por que o Lawliet nunca fica offline?",
                punchline: "Porque ele tem medo de perder o controle do servidor! 😂"
            },
            {
                setup: "O que a Loritta faz quando alguém não entende?",
                punchline: "Ela explica de novo, de novo e de novo... até desistir! 🤦‍♀️"
            },
            {
                setup: "Por que o ZeroTwo é o mais popular?",
                punchline: "Porque ele é o único que não quebra o servidor! 😎"
            },
            {
                setup: "O que acontece quando o Jockei Music para de tocar?",
                punchline: "O mundo para de girar! 🎵"
            },
            {
                setup: "Por que o Mudae nunca dá SSR?",
                punchline: "Porque ele guarda todos os SSR para ele mesmo! 🎲"
            },
            {
                setup: "Qual é a diferença entre o bot antigo e o novo?",
                punchline: "O novo funciona! (Às vezes...) 😅"
            },
            {
                setup: "Por que o grupo sempre está ativo?",
                punchline: "Porque alguém sempre tem algo aleatório para postar! 🤷‍♂️"
            },
            {
                setup: "O que o Lawliet faz quando vê spam?",
                punchline: "Ele bane na hora e depois explica por que! ⚡"
            }
        ];

        const randomPiada = piadas[Math.floor(Math.random() * piadas.length)];

        const embed = new EmbedBuilder()
            .setTitle('😄 Piada do Grupo')
            .setDescription(`**${randomPiada.setup}**\n\n${randomPiada.punchline}`)
            .setColor(0xffa502)
            .setTimestamp()
            .setFooter({ text: "Piada interna do grupo!" });

        await interaction.reply({ embeds: [embed] });
    }
};
