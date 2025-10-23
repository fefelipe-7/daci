const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia um usuário por um período')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ser silenciado')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tempo')
                .setDescription('Tempo do mute (ex: 10m, 1h, 1d)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const timeString = interaction.options.getString('tempo');
        const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({
                content: '❌ Usuário não encontrado no servidor!',
                ephemeral: true
            });
        }

        if (!member.moderatable) {
            return await interaction.reply({
                content: '❌ Não posso silenciar este usuário!',
                ephemeral: true
            });
        }

        try {
            let timeoutDuration = null;
            
            if (timeString) {
                // Parse do tempo (ex: 10m, 1h, 1d)
                const timeMatch = timeString.match(/^(\d+)([smhd])$/);
                if (timeMatch) {
                    const value = parseInt(timeMatch[1]);
                    const unit = timeMatch[2];
                    
                    switch (unit) {
                        case 's': timeoutDuration = value * 1000; break;
                        case 'm': timeoutDuration = value * 60 * 1000; break;
                        case 'h': timeoutDuration = value * 60 * 60 * 1000; break;
                        case 'd': timeoutDuration = value * 24 * 60 * 60 * 1000; break;
                    }
                }
            }

            // Aplicar timeout
            await member.timeout(timeoutDuration, reason);

            const embed = new EmbedBuilder()
                .setTitle('🔇 Usuário Silenciado')
                .setColor(0xff6b6b)
                .addFields(
                    { name: 'Usuário', value: `${user.tag}`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Duração', value: timeString || 'Permanente', inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `ID: ${user.id}` });

            await interaction.reply({ embeds: [embed] });

            // Log privado
            const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Erro no comando mute:', error);
            await interaction.reply({
                content: '❌ Erro ao silenciar usuário!',
                ephemeral: true
            });
        }
    }
};
