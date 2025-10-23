function detectPlatform(query) {
    // Spotify
    if (query.includes('spotify.com') || query.includes('spotify:')) {
        return 'spotify';
    }
    
    // YouTube
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
        return 'youtube';
    }
    
    // SoundCloud
    if (query.includes('soundcloud.com')) {
        return 'soundcloud';
    }
    
    // Se não é URL, é busca por nome
    return 'search';
}

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

function getSpotifyId(url) {
    // Extrair ID do Spotify de URLs como:
    // https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
    // spotify:track:4cOdK2wGLETKBW3PvgPWqT
    const trackMatch = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    if (trackMatch) {
        return { type: 'track', id: trackMatch[1] };
    }
    
    const playlistMatch = url.match(/playlist[\/:]([a-zA-Z0-9]+)/);
    if (playlistMatch) {
        return { type: 'playlist', id: playlistMatch[1] };
    }
    
    const albumMatch = url.match(/album[\/:]([a-zA-Z0-9]+)/);
    if (albumMatch) {
        return { type: 'album', id: albumMatch[1] };
    }
    
    return null;
}

module.exports = {
    detectPlatform,
    isURL,
    getSpotifyId
};

