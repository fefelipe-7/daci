const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, joinVoiceChannel } = require('@discordjs/voice');
const play = require('play-dl');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class MusicPlayer {
    async createConnection(voiceChannel, guildId) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        return connection;
    }

    async playSong(queue) {
        if (!queue || queue.songs.length === 0) {
            return false;
        }

        const song = queue.getNextSong();
        
        if (!song) {
            // Fila acabou
            await this.cleanup(queue);
            return false;
        }

        queue.currentSong = song;
        queue.playing = true;

        try {
            // Criar player se não existir
            if (!queue.player) {
                queue.player = createAudioPlayer();
                this.setupPlayerEvents(queue);
            }

            // Conectar ao canal de voz se não conectado
            if (!queue.connection) {
                queue.connection = await this.createConnection(queue.voiceChannel, queue.guildId);
                queue.connection.subscribe(queue.player);
            }

            // Criar stream de áudio
            console.log('🎵 Tocando:', song.title);
            const stream = await play.stream(song.url);
            
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true
            });

            resource.volume.setVolume(queue.volume / 100);
            queue.player.play(resource);

            // Enviar mensagem "Now Playing"
            await this.sendNowPlayingMessage(queue, song);

            return true;
        } catch (error) {
            console.error('Erro ao tocar música:', error);
            
            if (queue.textChannel) {
                await queue.textChannel.send(`❌ Erro ao tocar: **${song.title}**`);
            }

            // Tentar próxima música
            if (queue.songs.length > 0) {
                return await this.playSong(queue);
            }
            
            return false;
        }
    }

    setupPlayerEvents(queue) {
        queue.player.on(AudioPlayerStatus.Idle, async () => {
            console.log('🎵 Música terminou');
            
            // Limpar votos de skip
            queue.clearVotes();
            
            // Tocar próxima música
            const hasNext = await this.playSong(queue);
            
            if (!hasNext) {
                await this.cleanup(queue);
            }
        });

        queue.player.on('error', async (error) => {
            console.error('Erro no player:', error);
            
            if (queue.textChannel) {
                await queue.textChannel.send('❌ Erro ao reproduzir a música!');
            }
            
            // Tentar próxima música
            if (queue.songs.length > 0) {
                await this.playSong(queue);
            } else {
                await this.cleanup(queue);
            }
        });
    }

    async sendNowPlayingMessage(queue, song) {
        if (!queue.textChannel) return;

        const durationFormatted = this.formatDuration(song.duration);
        
        const platformEmoji = {
            'spotify': '🎵',
            'youtube': '▶️',
            'soundcloud': '🔊'
        };

        const embed = new EmbedBuilder()
            .setTitle('🎵 Tocando Agora')
            .setDescription(`**${song.title}**\n${song.artist}`)
            .setThumbnail(song.thumbnail)
            .setColor(0x1db954)
            .addFields(
                { name: 'Duração', value: durationFormatted, inline: true },
                { name: 'Plataforma', value: `${platformEmoji[song.platform] || '🎵'} ${song.platform.toUpperCase()}`, inline: true },
                { name: 'Volume', value: `${queue.volume}%`, inline: true }
            );

        if (queue.loop) {
            embed.addFields({ name: '🔁 Loop', value: 'Música', inline: true });
        } else if (queue.loopQueue) {
            embed.addFields({ name: '🔁 Loop', value: 'Fila', inline: true });
        }

        // Botões de controle
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_pause')
                    .setLabel('⏸️ Pausar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('music_skip')
                    .setLabel('⏭️ Pular')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('music_stop')
                    .setLabel('⏹️ Parar')
                    .setStyle(ButtonStyle.Danger)
            );

        try {
            await queue.textChannel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    }

    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    async cleanup(queue) {
        console.log('🧹 Limpando fila...');
        
        if (queue.textChannel) {
            try {
                await queue.textChannel.send('👋 Fila vazia! Saindo do canal de voz...');
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }

        if (queue.player) {
            queue.player.stop();
        }

        if (queue.connection) {
            queue.connection.destroy();
        }

        const QueueManager = require('./QueueManager');
        QueueManager.delete(queue.guildId);
    }

    pause(queue) {
        if (queue && queue.player) {
            queue.player.pause();
            queue.playing = false;
            return true;
        }
        return false;
    }

    resume(queue) {
        if (queue && queue.player) {
            queue.player.unpause();
            queue.playing = true;
            return true;
        }
        return false;
    }

    stop(queue) {
        if (queue) {
            queue.clear();
            if (queue.player) {
                queue.player.stop();
            }
            this.cleanup(queue);
            return true;
        }
        return false;
    }

    skip(queue) {
        if (queue && queue.player) {
            queue.clearVotes();
            queue.player.stop(); // Vai disparar evento Idle e tocar próxima
            return true;
        }
        return false;
    }

    setVolume(queue, volume) {
        if (queue) {
            queue.volume = Math.max(0, Math.min(100, volume));
            // Aplicar volume se estiver tocando
            if (queue.player && queue.player.state.resource) {
                queue.player.state.resource.volume.setVolume(queue.volume / 100);
            }
            return true;
        }
        return false;
    }
}

module.exports = new MusicPlayer();

