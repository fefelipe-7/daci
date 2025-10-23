// Lazy load - bibliotecas mais leves e rápidas
let ytdl, ytsr, fetch;

class MusicProcessor {
    constructor() {
        this.cache = new Map(); // Cache de Spotify -> YouTube
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
            // Lazy load ytdl-core
            if (!ytdl) ytdl = require('ytdl-core');

            console.log('🎵 Processando YouTube...');
            
            // Validar URL
            if (!ytdl.validateURL(url)) {
                throw new Error('URL inválida do YouTube');
            }

            // Obter informações básicas (rápido)
            const info = await ytdl.getBasicInfo(url);
            const details = info.videoDetails;
            
            return {
                title: details.title,
                artist: details.author?.name || details.ownerChannelName || 'YouTube',
                url: details.video_url,
                thumbnail: details.thumbnails?.[0]?.url || '',
                duration: parseInt(details.lengthSeconds) || 0,
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
            // Lazy load
            if (!ytsr) ytsr = require('youtube-sr').default;

            console.log('🔍 Buscando no YouTube:', query);
            
            // Busca rápida
            const results = await ytsr.searchOne(query, 'video');
            
            if (!results) {
                throw new Error('Nenhum resultado encontrado');
            }

            console.log('📝 Resultado YouTube:', {
                title: results.title,
                id: results.id
            });

            // Construir URL
            const videoUrl = `https://www.youtube.com/watch?v=${results.id}`;

            return {
                title: results.title || 'Sem título',
                artist: results.channel?.name || 'YouTube',
                url: videoUrl,
                thumbnail: results.thumbnail?.url || results.thumbnail?.displayThumbnailURL?.() || '',
                duration: results.duration || 0,
                platform: 'youtube',
                originalUrl: videoUrl
            };
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