const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra informações sobre o servidor'),

    async execute(interaction) {
        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setTitle(`🏰 ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .setColor(0x7289da)
            .addFields(
                { name: '🆔 ID do Servidor', value: guild.id, inline: true },
                { name: '👑 Dono', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
                { name: '📝 Canais', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🔒 Nível de Verificação', value: getVerificationLevel(guild.verificationLevel), inline: true },
                { name: '📊 Nível de Boost', value: `Nível ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Solicitado por ${interaction.user.tag}` });

        // Adicionar estatísticas de canais
        const channelStats = {
            '📝 Texto': guild.channels.cache.filter(c => c.type === 0).size,
            '🔊 Voz': guild.channels.cache.filter(c => c.type === 2).size,
            '📢 Anúncios': guild.channels.cache.filter(c => c.type === 5).size,
            '🧵 Threads': guild.channels.cache.filter(c => c.type === 11).size
        };

        const channelInfo = Object.entries(channelStats)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `${type}: ${count}`)
            .join('\n');

        if (channelInfo) {
            embed.addFields({
                name: '📊 Canais por Tipo',
                value: channelInfo,
                inline: false
            });
        }

        // Adicionar features do servidor
        const features = guild.features;
        if (features.length > 0) {
            const featureNames = features.map(feature => {
                const featureMap = {
                    'VERIFIED': '✅ Verificado',
                    'PARTNERED': '🤝 Parceiro',
                    'DISCOVERABLE': '🔍 Descobrível',
                    'COMMUNITY': '🏘️ Comunidade',
                    'FEATURABLE': '⭐ Destacável',
                    'NEWS': '📰 Notícias',
                    'MONETIZATION_ENABLED': '💰 Monetização',
                    'MORE_EMOJI': '😀 Mais Emojis',
                    'MORE_STICKERS': '🎭 Mais Stickers',
                    'INVITE_SPLASH': '🎨 Splash de Convite',
                    'BANNER': '🖼️ Banner',
                    'VANITY_URL': '🔗 URL Personalizada',
                    'ANIMATED_ICON': '🎬 Ícone Animado',
                    'ANIMATED_BANNER': '🎬 Banner Animado'
                };
                return featureMap[feature] || feature;
            });

            embed.addFields({
                name: '✨ Recursos do Servidor',
                value: featureNames.join('\n'),
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};

function getVerificationLevel(level) {
    const levels = {
        0: '🔓 Nenhum',
        1: '📧 Baixo',
        2: '📱 Médio',
        3: '⏰ Alto',
        4: '🔒 Muito Alto'
    };
    return levels[level] || 'Desconhecido';
}
