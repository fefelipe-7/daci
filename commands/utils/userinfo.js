const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informações sobre um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver informações')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return await interaction.reply({
                content: '❌ Usuário não encontrado no servidor!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`👤 Informações de ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setColor(member.displayHexColor || 0x7289da)
            .addFields(
                { name: '📝 Nome de usuário', value: targetUser.tag, inline: true },
                { name: '🆔 ID', value: targetUser.id, inline: true },
                { name: '🤖 Bot', value: targetUser.bot ? 'Sim' : 'Não', inline: true },
                { name: '📅 Conta criada', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '📥 Entrou no servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: '🎭 Apelido', value: member.nickname || 'Nenhum', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` });

        // Adicionar roles se houver
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .slice(0, 10); // Limitar a 10 roles

        if (roles.length > 0) {
            embed.addFields({
                name: `🎭 Roles (${roles.length})`,
                value: roles.join(', '),
                inline: false
            });
        }

        // Adicionar status de atividade se disponível
        if (member.presence) {
            const activities = member.presence.activities
                .filter(activity => activity.type !== 4) // Remover custom status
                .map(activity => {
                    switch (activity.type) {
                        case 0: return `🎮 Jogando ${activity.name}`;
                        case 1: return `📺 Assistindo ${activity.name}`;
                        case 2: return `🎵 Ouvindo ${activity.name}`;
                        case 3: return `📹 Assistindo ${activity.name}`;
                        case 5: return `🎮 Jogando ${activity.name}`;
                        default: return activity.name;
                    }
                });

            if (activities.length > 0) {
                embed.addFields({
                    name: '🎯 Atividade',
                    value: activities.join('\n'),
                    inline: false
                });
            }
        }

        await interaction.reply({ embeds: [embed] });
    }
};
