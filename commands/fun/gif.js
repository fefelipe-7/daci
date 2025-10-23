const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('Busca um GIF com palavra-chave (prioriza termos internos do grupo)')
        .addStringOption(option =>
            option.setName('palavra')
                .setDescription('Palavra-chave para buscar GIF')
                .setRequired(true)),

    async execute(interaction) {
        const keyword = interaction.options.getString('palavra').toLowerCase();
        
        // Termos internos do grupo com prioridade
        const internalTerms = {
            'lawliet': {
                gif: 'https://i.imgur.com/lawliet_gif.gif',
                description: 'Lawliet sendo Lawliet! 😤'
            },
            'loritta': {
                gif: 'https://i.imgur.com/loritta_gif.gif',
                description: 'Loritta explicando algo! 🤔'
            },
            'zerotwo': {
                gif: 'https://i.imgur.com/zerotwo_gif.gif',
                description: 'ZeroTwo sendo fofo! 😏'
            },
            'jockei': {
                gif: 'https://i.imgur.com/jockei_gif.gif',
                description: 'Jockei Music tocando! 🎵'
            },
            'mudae': {
                gif: 'https://i.imgur.com/mudae_gif.gif',
                description: 'Mudae rolando gacha! 🎲'
            },
            'bot': {
                gif: 'https://i.imgur.com/bot_gif.gif',
                description: 'Bot funcionando! 🤖'
            },
            'grupo': {
                gif: 'https://i.imgur.com/grupo_gif.gif',
                description: 'Grupo sendo grupo! 👥'
            }
        };

        let gifData;
        
        // Verificar se é um termo interno
        if (internalTerms[keyword]) {
            gifData = internalTerms[keyword];
        } else {
            // GIFs genéricos para outros termos
            const genericGifs = [
                'https://i.imgur.com/generic1.gif',
                'https://i.imgur.com/generic2.gif',
                'https://i.imgur.com/generic3.gif'
            ];
            
            gifData = {
                gif: genericGifs[Math.floor(Math.random() * genericGifs.length)],
                description: `GIF relacionado a "${keyword}"! 🎭`
            };
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎭 GIF: ${keyword}`)
            .setDescription(gifData.description)
            .setImage(gifData.gif)
            .setColor(0xff6b6b)
            .setTimestamp()
            .setFooter({ text: "GIF do grupo!" });

        await interaction.reply({ embeds: [embed] });
    }
};
