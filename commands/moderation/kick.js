const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa um membro do servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário a ser expulso')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo da expulsão')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({
                content: '❌ Usuário não encontrado no servidor!',
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return await interaction.reply({
                content: '❌ Não posso expulsar este usuário!',
                ephemeral: true
            });
        }

        try {
            await member.kick(reason);
            
            const embed = {
                color: 0xff6b6b,
                title: '👢 Usuário Expulso',
                fields: [
                    { name: 'Usuário', value: `${user.tag}`, inline: true },
                    { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Motivo', value: reason, inline: false }
                ],
                timestamp: new Date().toISOString(),
                footer: { text: `ID: ${user.id}` }
            };

            await interaction.reply({ embeds: [embed] });

            // Log privado
            const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Erro ao expulsar usuário:', error);
            await interaction.reply({
                content: '❌ Erro ao expulsar o usuário!',
                ephemeral: true
            });
        }
    }
};
