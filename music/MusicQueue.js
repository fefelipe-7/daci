class MusicQueue {
    constructor(guildId) {
        this.guildId = guildId;
        this.songs = [];
        this.volume = 50;
        this.loop = false;        // loop música atual
        this.loopQueue = false;   // loop fila inteira
        this.shuffle = false;
        this.playing = false;
        this.connection = null;
        this.player = null;
        this.textChannel = null;
        this.voiceChannel = null;
        this.skipVotes = new Set();
        this.currentSong = null;
    }

    addSong(song) {
        this.songs.push(song);
    }

    getNextSong() {
        if (this.loop && this.currentSong) {
            return this.currentSong;
        }

        if (this.songs.length === 0) {
            return null;
        }

        const song = this.songs.shift();
        
        if (this.loopQueue) {
            this.songs.push(song);
        }

        return song;
    }

    clearVotes() {
        this.skipVotes.clear();
    }

    shuffleQueue() {
        for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
        }
    }

    clear() {
        this.songs = [];
        this.currentSong = null;
        this.skipVotes.clear();
    }
}

module.exports = MusicQueue;

