const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Envia um meme aleatório do banco interno do grupo'),

    async execute(interaction) {
        // Memes internos do grupo - personalizados
        const memes = [
            {
                title: "Lawliet quando alguém quebra o servidor",
                image: "https://i.imgur.com/lawliet_angry.jpg",
                description: "😤 A clássica reação do Lawliet"
            },
            {
                title: "Loritta tentando explicar algo",
                image: "https://i.imgur.com/loritta_explain.jpg", 
                description: "🤔 Quando a Loritta tenta ser didática"
            },
            {
                title: "ZeroTwo sendo ZeroTwo",
                image: "https://i.imgur.com/zerotwo_being_zerotwo.jpg",
                description: "😏 ZeroTwo sendo... ZeroTwo"
            },
            {
                title: "Jockei Music tocando a mesma música",
                image: "https://i.imgur.com/jockei_repeat.jpg",
                description: "🎵 Quando o Jockei fica em loop"
            },
            {
                title: "Mudae dando SSR",
                image: "https://i.imgur.com/mudae_ssr.jpg",
                description: "🎲 A raridade que ninguém consegue"
            },
            {
                title: "Grupo quando alguém posta algo aleatório",
                image: "https://i.imgur.com/group_random.jpg",
                description: "🤷‍♂️ Reação padrão do grupo"
            },
            {
                title: "Quando o bot antigo quebra",
                image: "https://i.imgur.com/old_bot_broke.jpg",
                description: "💀 RIP bots antigos"
            },
            {
                title: "Novo bot funcionando perfeitamente",
                image: "https://i.imgur.com/new_bot_working.jpg",
                description: "✅ Agora sim, tudo funcionando!"
            }
        ];

        const randomMeme = memes[Math.floor(Math.random() * memes.length)];

        const embed = new EmbedBuilder()
            .setTitle(`😂 ${randomMeme.title}`)
            .setDescription(randomMeme.description)
            .setImage(randomMeme.image)
            .setColor(0xff6b6b)
            .setTimestamp()
            .setFooter({ text: "Meme interno do grupo!" });

        await interaction.reply({ embeds: [embed] });
    }
};
