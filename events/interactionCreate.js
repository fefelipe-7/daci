module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handler para comandos slash
        if (interaction.isChatInputCommand()) {
            // Log único para debug de latência
            const idade = Date.now() - interaction.createdTimestamp;
            if (idade > 1000) {
                console.log(`⚠️ Interação /${interaction.commandName} chegou com ${idade}ms de idade`);
            }
            
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
                
                const errorMessage = {
                    content: '❌ Houve um erro ao executar este comando!',
                    flags: 64 // MessageFlags.Ephemeral
                };

                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(errorMessage);
                    } else {
                        await interaction.reply(errorMessage);
                    }
                } catch (err) {
                    console.error('Erro ao responder interação:', err);
                }
            }
            return;
        }

        // Handler para botões
        if (interaction.isButton()) {
            // Apenas botões de música
            if (!interaction.customId.startsWith('music_')) return;

            // Lazy load (só quando necessário)
            const QueueManager = require('../music/QueueManager');
            const MusicPlayer = require('../music/MusicPlayer');

            const queue = QueueManager.get(interaction.guild.id);

            if (!queue) {
                return await interaction.reply({
                    content: '❌ Não há nada tocando no momento!',
                    flags: 64 // MessageFlags.Ephemeral
                });
            }

            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel || voiceChannel.id !== queue.voiceChannel.id) {
                return await interaction.reply({
                    content: '❌ Você precisa estar no mesmo canal de voz que eu!',
                    flags: 64 // MessageFlags.Ephemeral
                });
            }

            try {
                switch (interaction.customId) {
                    case 'music_pause':
                        if (queue.playing) {
                            MusicPlayer.pause(queue);
                            await interaction.reply({
                                content: `⏸️ **${interaction.user.username}** pausou a música`
                            });
                        } else {
                            MusicPlayer.resume(queue);
                            await interaction.reply({
                                content: `▶️ **${interaction.user.username}** retomou a música`
                            });
                        }
                        break;

                    case 'music_skip':
                        // Sistema de votação
                        const members = voiceChannel.members.filter(m => !m.user.bot);
                        const membersCount = members.size;

                        if (membersCount <= 2) {
                            MusicPlayer.skip(queue);
                            await interaction.reply({
                                content: `⏭️ **${interaction.user.username}** pulou a música`
                            });
                        } else {
                            queue.skipVotes.add(interaction.user.id);
                            const votesNeeded = Math.ceil(membersCount / 2);

                            if (queue.skipVotes.size >= votesNeeded) {
                                MusicPlayer.skip(queue);
                                await interaction.reply({
                                    content: `⏭️ Música pulada! (${queue.skipVotes.size}/${votesNeeded} votos)`
                                });
                            } else {
                                await interaction.reply({
                                    content: `🗳️ **${interaction.user.username}** votou para pular (${queue.skipVotes.size}/${votesNeeded})`
                                });
                            }
                        }
                        break;

                    case 'music_stop':
                        MusicPlayer.stop(queue);
                        await interaction.reply({
                            content: `⏹️ **${interaction.user.username}** parou a reprodução`
                        });
                        break;

                    default:
                        await interaction.reply({
                            content: '❌ Botão desconhecido!',
                            flags: 64 // MessageFlags.Ephemeral
                        });
                }
            } catch (error) {
                console.error('Erro ao processar botão:', error);
            }
        }
    }
};
