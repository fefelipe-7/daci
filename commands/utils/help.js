const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra todos os comandos disponíveis')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoria específica de comandos')
                .addChoices(
                    { name: '🛡️ Moderação', value: 'moderation' },
                    { name: '🎲 Gacha', value: 'gacha' },
                    { name: '🎉 Diversão', value: 'fun' },
                    { name: '🎵 Música', value: 'music' },
                    { name: '🔧 Utilidades', value: 'utils' }
                )
                .setRequired(false)),

    async execute(interaction) {
        const category = interaction.options.getString('categoria');

        if (category) {
            await showCategoryHelp(interaction, category);
        } else {
            await showMainHelp(interaction);
        }
    }
};

async function showMainHelp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Multifuncional - Comandos Disponíveis')
        .setDescription('Um bot que substitui Lawliet, Mudae, Loritta, ZeroTwo e Jockei Music!')
        .setColor(0x7289da)
        .addFields(
            {
                name: '🛡️ Moderação',
                value: '`/kick` - Expulsa um membro\n`/ban` - Bane um membro\n`/clear` - Limpa mensagens',
                inline: true
            },
            {
                name: '🎲 Gacha/Colecionáveis',
                value: '`/roll` - Rola um personagem\n`/inventory` - Ver inventário',
                inline: true
            },
            {
                name: '🎉 Diversão',
                value: '`/meme` - Meme aleatório\n`/8ball` - Bola 8 mágica',
                inline: true
            },
            {
                name: '🎵 Música',
                value: '`/play` - Toca música\n`/pause` - Pausa música\n`/skip` - Pula música',
                inline: true
            },
            {
                name: '🔧 Utilidades',
                value: '`/userinfo` - Info do usuário\n`/serverinfo` - Info do servidor',
                inline: true
            }
        )
        .setFooter({ text: 'Use /help <categoria> para ver comandos específicos' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function showCategoryHelp(interaction, category) {
        const categoryInfo = {
        moderation: {
            title: '🛡️ Comandos de Moderação',
            description: 'Comandos para moderar o servidor',
            color: 0xff4757,
            commands: [
                { name: '/kick', description: 'Expulsa um membro do servidor', usage: '/kick @usuário [motivo]' },
                { name: '/ban', description: 'Bane um membro do servidor', usage: '/ban @usuário [motivo] [dias]' },
                { name: '/warn', description: 'Adiciona aviso ao usuário', usage: '/warn @usuário [motivo]' },
                { name: '/clear', description: 'Limpa mensagens do canal', usage: '/clear <quantidade> [@usuário]' },
                { name: '/mute', description: 'Silencia um usuário', usage: '/mute @usuário [tempo] [motivo]' },
                { name: '/unmute', description: 'Remove silêncio do usuário', usage: '/unmute @usuário' }
            ]
        },
        fun: {
            title: '🎉 Comandos de Diversão',
            description: 'Comandos para entretenimento',
            color: 0xffa502,
            commands: [
                { name: '/piada', description: 'Envia piada interna do grupo', usage: '/piada' },
                { name: '/meme', description: 'Envia meme interno do grupo', usage: '/meme' },
                { name: '/gif', description: 'Busca GIF com palavra-chave', usage: '/gif <palavra>' },
                { name: '/adivinhar', description: 'Jogo de adivinhar número', usage: '/adivinhar <número>' },
                { name: '/quiz', description: 'Pergunta sobre o grupo', usage: '/quiz' },
                { name: '/8ball', description: 'Bola 8 mágica', usage: '/8ball <pergunta>' }
            ]
        },
        music: {
            title: '🎵 Comandos de Música (Estilo Jockie Music)',
            description: 'Sistema completo: Spotify, YouTube, SoundCloud',
            color: 0x1db954,
            commands: [
                { name: '/play', description: 'Toca de Spotify/YouTube/SoundCloud ou busca', usage: '/play <URL/nome>' },
                { name: '/pause', description: 'Pausa a música', usage: '/pause' },
                { name: '/resume', description: 'Retoma música pausada', usage: '/resume' },
                { name: '/skip', description: 'Pula música (votação se >2 pessoas)', usage: '/skip' },
                { name: '/stop', description: 'Para tudo e limpa fila', usage: '/stop' },
                { name: '/queue', description: 'Mostra fila com paginação', usage: '/queue [página]' },
                { name: '/volume', description: 'Ajusta volume (0-100)', usage: '/volume <0-100>' },
                { name: '/loop', description: 'Loop música ou fila', usage: '/loop <off/song/queue>' },
                { name: '/shuffle', description: 'Embaralha fila', usage: '/shuffle' },
                { name: '/np', description: 'Mostra música atual detalhada', usage: '/np' }
            ]
        },
        utils: {
            title: '🔧 Comandos de Utilidades',
            description: 'Comandos úteis gerais',
            color: 0x2ed573,
            commands: [
                { name: '/userinfo', description: 'Informações do usuário', usage: '/userinfo [@usuário]' },
                { name: '/serverinfo', description: 'Informações do servidor', usage: '/serverinfo' },
                { name: '/lembrete', description: 'Cria lembrete pessoal', usage: '/lembrete <tempo> <mensagem>' },
                { name: '/enquete', description: 'Cria enquete no canal', usage: '/enquete <pergunta> <opções>' },
                { name: '/stats', description: 'Estatísticas do bot', usage: '/stats' }
            ]
        }
    };

    const info = categoryInfo[category];
    if (!info) {
        return await interaction.reply({
            content: '❌ Categoria não encontrada!',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle(info.title)
        .setDescription(info.description)
        .setColor(info.color)
        .setTimestamp();

    info.commands.forEach(cmd => {
        embed.addFields({
            name: cmd.name,
            value: `${cmd.description}\n**Uso:** \`${cmd.usage}\``,
            inline: false
        });
    });

    await interaction.reply({ embeds: [embed] });
}
