// Lazy load - bibliotecas mais leves e rápidas
let ytdl, ytsr, fetch;

class MusicProcessor {
    constructor() {
        this.cache = new Map(); // Cache de Spotify -> YouTube
    }

    // Helper para formatar duração
    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    async processSong(query, platform) {
        try {
            switch (platform) {
                case 'spotify':
                    return await this.processSpotify(query);
                case 'youtube':
                    return await this.processYouTube(query);
                case 'soundcloud':
                    return await this.processSoundCloud(query);
                case 'search':
                    return await this.searchYouTube(query);
                default:
                    throw new Error('Plataforma não suportada');
            }
        } catch (error) {
            console.error('Erro ao processar música:', error);
            throw error;
        }
    }

    async processSpotify(url) {
        try {
            // Lazy load
            if (!fetch) fetch = (await import('node-fetch')).default;
            
            // Verificar cache
            if (this.cache.has(url)) {
                console.log('💾 Usando cache para:', url);
                return this.cache.get(url);
            }

            // Extrair ID do Spotify
            const trackId = url.match(/track\/([a-zA-Z0-9]+)/)?.[1];
            if (!trackId) {
                throw new Error('URL do Spotify inválida');
            }

            console.log('🎵 Extraindo info do Spotify...');
            
            // Usar API pública do Spotify (sem autenticação)
            const response = await fetch(`https://open.spotify.com/oembed?url=${url}`);
            const data = await response.json();
            
            // Extrair nome e artista do título
            const title = data.title; // Ex: "Song Name · Artist Name"
            const [songName, artistName] = title.split(' · ');

            // Buscar no YouTube
            const searchQuery = `${songName} ${artistName || ''}`.trim();
            console.log('🔍 Buscando no YouTube:', searchQuery);
            
            const ytResult = await this.searchYouTube(searchQuery);
            
            const songInfo = {
                title: songName,
                artist: artistName || 'Desconhecido',
                url: ytResult.url,
                thumbnail: data.thumbnail_url || ytResult.thumbnail,
                duration: ytResult.duration,
                durationFormatted: this.formatDuration(ytResult.duration),
                platform: 'spotify',
                originalUrl: url
            };

            // Salvar no cache
            this.cache.set(url, songInfo);
            
            return songInfo;
        } catch (error) {
            console.error('Erro ao processar Spotify:', error);
            // Fallback: buscar o link diretamente
            return await this.searchYouTube(url);
        }
    }

    async processYouTube(url) {
        try {
            // Lazy load play-dl
            const play = require('play-dl');

            console.log('🎵 Processando YouTube...');
            
            // Validar URL
            if (!play.yt_validate(url)) {
                throw new Error('URL inválida do YouTube');
            }

            // Obter informações
            const info = await play.video_info(url);
            const video = info.video_details;
            
            const duration = video.durationInSec || 0;
            
            return {
                title: video.title,
                artist: video.channel?.name || 'YouTube',
                url: video.url,
                thumbnail: video.thumbnails[0]?.url || '',
                duration: duration,
                durationFormatted: this.formatDuration(duration),
                platform: 'youtube',
                originalUrl: url
            };
        } catch (error) {
            console.error('Erro ao processar YouTube:', error);
            throw new Error('Não foi possível processar o vídeo do YouTube');
        }
    }

    async processSoundCloud(url) {
        try {
            // SoundCloud é complicado, vamos buscar no YouTube mesmo
            console.log('🎵 Convertendo SoundCloud para YouTube...');
            return await this.searchYouTube(url);
        } catch (error) {
            console.error('Erro ao processar SoundCloud:', error);
            throw new Error('Não foi possível processar a música do SoundCloud');
        }
    }

    async searchYouTube(query) {
        try {
            // Lazy load play-dl
            const play = require('play-dl');

            console.log('🔍 Buscando no YouTube:', query);
            
            // Busca usando play-dl
            const results = await play.search(query, { limit: 1 });
            
            if (!results || results.length === 0) {
                throw new Error('Nenhum resultado encontrado');
            }

            const video = results[0];

            console.log('📝 Resultado YouTube:', {
                title: video.title,
                id: video.id
            });

            const duration = video.durationInSec || 0;
            
            const songInfo = {
                title: video.title || 'Sem título',
                artist: video.channel?.name || 'YouTube',
                url: video.url,
                thumbnail: video.thumbnails[0]?.url || '',
                duration: duration,
                durationFormatted: this.formatDuration(duration),
                platform: 'youtube',
                originalUrl: video.url
            };
            
            console.log('📦 SongInfo gerado:', JSON.stringify(songInfo, null, 2));
            
            return songInfo;
        } catch (error) {
            console.error('Erro ao buscar no YouTube:', error);
            throw new Error('Não foi possível encontrar a música no YouTube');
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

module.exports = new MusicProcessor();