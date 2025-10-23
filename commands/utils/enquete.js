const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enquete')
        .setDescription('Cria uma enquete no canal')
        .addStringOption(option =>
            option.setName('pergunta')
                .setDescription('Pergunta da enquete')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('opcoes')
                .setDescription('Opções separadas por vírgula (ex: Sim,Não,Talvez)')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('pergunta');
        const optionsString = interaction.options.getString('opcoes');
        
        // Dividir opções por vírgula
        const options = optionsString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
        
        if (options.length < 2) {
            return await interaction.reply({
                content: '❌ É necessário pelo menos 2 opções!',
                ephemeral: true
            });
        }

        if (options.length > 10) {
            return await interaction.reply({
                content: '❌ Máximo de 10 opções permitidas!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Enquete')
            .setDescription(`**${question}**`)
            .setColor(0x7289da)
            .setTimestamp()
            .setFooter({ text: `Criada por ${interaction.user.tag}` });

        // Adicionar opções como campos
        options.forEach((option, index) => {
            embed.addFields({
                name: `${index + 1}. ${option}`,
                value: '0 votos',
                inline: true
            });
        });

        const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Adicionar reações para cada opção
        const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        for (let i = 0; i < options.length; i++) {
            try {
                await pollMessage.react(reactions[i]);
            } catch (error) {
                console.error('Erro ao adicionar reação:', error);
            }
        }
    }
};
