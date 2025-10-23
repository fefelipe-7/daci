const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lembrete')
        .setDescription('Cria um lembrete para você')
        .addStringOption(option =>
            option.setName('tempo')
                .setDescription('Tempo do lembrete (ex: 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mensagem')
                .setDescription('Mensagem do lembrete')
                .setRequired(true)),

    async execute(interaction) {
        const timeString = interaction.options.getString('tempo');
        const message = interaction.options.getString('mensagem');
        
        // Parse do tempo (ex: 10m, 1h, 1d)
        const timeMatch = timeString.match(/^(\d+)([smhd])$/);
        if (!timeMatch) {
            return await interaction.reply({
                content: '❌ Formato de tempo inválido! Use: 10s, 5m, 1h, 2d',
                ephemeral: true
            });
        }

        const value = parseInt(timeMatch[1]);
        const unit = timeMatch[2];
        
        let timeoutDuration;
        switch (unit) {
            case 's': timeoutDuration = value * 1000; break;
            case 'm': timeoutDuration = value * 60 * 1000; break;
            case 'h': timeoutDuration = value * 60 * 60 * 1000; break;
            case 'd': timeoutDuration = value * 24 * 60 * 60 * 1000; break;
        }

        // Verificar limite máximo (24 horas)
        if (timeoutDuration > 24 * 60 * 60 * 1000) {
            return await interaction.reply({
                content: '❌ Lembrete muito longo! Máximo: 24 horas',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('⏰ Lembrete Criado')
            .setDescription(`**Mensagem:** ${message}\n**Tempo:** ${timeString}`)
            .setColor(0xffa502)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Aqui você implementaria o sistema de lembretes
        // Por simplicidade, vamos apenas mostrar uma mensagem após o tempo
        setTimeout(async () => {
            const reminderEmbed = new EmbedBuilder()
                .setTitle('🔔 Lembrete!')
                .setDescription(`**${interaction.user}**, você pediu para lembrar:\n\n${message}`)
                .setColor(0xff6b6b)
                .setTimestamp();

            try {
                await interaction.followUp({ embeds: [reminderEmbed] });
            } catch (error) {
                console.error('Erro ao enviar lembrete:', error);
            }
        }, timeoutDuration);
    }
};
