const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log(`🤖 ${client.user.tag} está online!`);
        console.log(`📊 Conectado a ${client.guilds.cache.size} servidor(es)`);
        console.log(`👥 Servindo ${client.users.cache.size} usuário(s)`);
        
        // Definir status do bot
        client.user.setActivity('múltiplas funcionalidades | /help', { 
            type: ActivityType.Watching 
        });
    }
};
