const MusicQueue = require('./MusicQueue');

class QueueManager {
    constructor() {
        this.queues = new Map();
    }

    get(guildId) {
        return this.queues.get(guildId);
    }

    create(guildId, textChannel, voiceChannel) {
        const queue = new MusicQueue(guildId);
        queue.textChannel = textChannel;
        queue.voiceChannel = voiceChannel;
        this.queues.set(guildId, queue);
        return queue;
    }

    delete(guildId) {
        const queue = this.queues.get(guildId);
        if (queue) {
            // Cleanup
            if (queue.connection) {
                queue.connection.destroy();
            }
            if (queue.player) {
                queue.player.stop();
            }
            this.queues.delete(guildId);
        }
    }

    has(guildId) {
        return this.queues.has(guildId);
    }
}

// Singleton instance
module.exports = new QueueManager();

