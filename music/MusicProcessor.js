// Lazy load - só carrega quando realmente usar
let play, getData, YouTube;

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
            if (!getData) getData = require('spotify-url-info').getData;
            if (!YouTube) YouTube = require('youtube-sr').default;

            // Verificar cache
            if (this.cache.has(url)) {
                console.log('💾 Usando cache para:', url);
                return this.cache.get(url);
            }

            // 1. Extrair metadados do Spotify
            console.log('🎵 Extraindo info do Spotify...');
            const spotifyData = await getData(url);
            
            // 2. Buscar no YouTube
            const searchQuery = `${spotifyData.name} ${spotifyData.artists ? spotifyData.artists.map(a => a.name).join(' ') : ''}`;
            console.log('🔍 Buscando no YouTube:', searchQuery);
            
            const ytResults = await YouTube.searchOne(searchQuery);
            
            if (!ytResults) {
                throw new Error('Música não encontrada no YouTube');
            }

            const songInfo = {
                title: spotifyData.name,
                artist: spotifyData.artists ? spotifyData.artists.map(a => a.name).join(', ') : 'Desconhecido',
                url: ytResults.url,
                thumbnail: spotifyData.coverArt?.sources?.[0]?.url || ytResults.thumbnail?.url || '',
                duration: spotifyData.duration || ytResults.duration,
                platform: 'spotify',
                originalUrl: url
            };

            // Salvar no cache
            this.cache.set(url, songInfo);
            
            return songInfo;
        } catch (error) {
            console.error('Erro ao processar Spotify:', error);
            throw new Error('Não foi possível processar a música do Spotify');
        }
    }

    async processYouTube(url) {
        try {
            // Lazy load
            if (!play) play = require('play-dl');

            console.log('🎵 Processando YouTube...');
            const info = await play.video_info(url);
            
            return {
                title: info.video_details.title,
                artist: info.video_details.channel?.name || 'YouTube',
                url: info.video_details.url,
                thumbnail: info.video_details.thumbnails?.[0]?.url || '',
                duration: info.video_details.durationInSec,
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
            // Lazy load
            if (!play) play = require('play-dl');

            console.log('🎵 Processando SoundCloud...');
            const info = await play.soundcloud(url);
            
            return {
                title: info.name,
                artist: info.user?.name || 'SoundCloud',
                url: info.url,
                thumbnail: info.thumbnail || '',
                duration: info.durationInSec,
                platform: 'soundcloud',
                originalUrl: url
            };
        } catch (error) {
            console.error('Erro ao processar SoundCloud:', error);
            throw new Error('Não foi possível processar a música do SoundCloud');
        }
    }

    async searchYouTube(query) {
        try {
            // Lazy load
            if (!YouTube) YouTube = require('youtube-sr').default;

            console.log('🔍 Buscando no YouTube:', query);
            const results = await YouTube.searchOne(query);
            
            if (!results) {
                throw new Error('Nenhum resultado encontrado');
            }

            console.log('📝 Resultado YouTube:', {
                title: results.title,
                url: results.url,
                id: results.id
            });

            // YouTube.searchOne retorna objeto diferente, precisamos construir URL
            const videoUrl = results.url || `https://www.youtube.com/watch?v=${results.id}`;

            return {
                title: results.title,
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
