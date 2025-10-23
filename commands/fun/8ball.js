const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Faz uma pergunta para a bola 8 mágica')
        .addStringOption(option =>
            option.setName('pergunta')
                .setDescription('Sua pergunta para a bola 8')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('pergunta');
        
        const responses = [
            { text: "É certo!", color: 0x2ed573, emoji: "✅" },
            { text: "É decididamente assim.", color: 0x2ed573, emoji: "✅" },
            { text: "Sem dúvida.", color: 0x2ed573, emoji: "✅" },
            { text: "Sim, definitivamente.", color: 0x2ed573, emoji: "✅" },
            { text: "Você pode contar com isso.", color: 0x2ed573, emoji: "✅" },
            { text: "Como eu vejo, sim.", color: 0x2ed573, emoji: "✅" },
            { text: "Muito provável.", color: 0x2ed573, emoji: "✅" },
            { text: "Parece bom.", color: 0x2ed573, emoji: "✅" },
            { text: "Sim.", color: 0x2ed573, emoji: "✅" },
            { text: "Os sinais apontam para sim.", color: 0x2ed573, emoji: "✅" },
            
            { text: "Resposta nebulosa, tente novamente.", color: 0xffa502, emoji: "🟡" },
            { text: "Pergunte novamente mais tarde.", color: 0xffa502, emoji: "🟡" },
            { text: "Melhor não te dizer agora.", color: 0xffa502, emoji: "🟡" },
            { text: "Não posso prever agora.", color: 0xffa502, emoji: "🟡" },
            { text: "Concentre-se e pergunte novamente.", color: 0xffa502, emoji: "🟡" },
            
            { text: "Não conte com isso.", color: 0xff4757, emoji: "❌" },
            { text: "Minha resposta é não.", color: 0xff4757, emoji: "❌" },
            { text: "Minhas fontes dizem não.", color: 0xff4757, emoji: "❌" },
            { text: "Muito duvidoso.", color: 0xff4757, emoji: "❌" },
            { text: "Não.", color: 0xff4757, emoji: "❌" }
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setTitle("🎱 Bola 8 Mágica")
            .addFields(
                { name: "❓ Pergunta", value: question, inline: false },
                { name: "🔮 Resposta", value: `${randomResponse.emoji} ${randomResponse.text}`, inline: false }
            )
            .setColor(randomResponse.color)
            .setTimestamp()
            .setFooter({ text: "A bola 8 sempre tem a resposta!" });

        await interaction.reply({ embeds: [embed] });
    }
};
