const { ActivityType } = require('discord.js');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`🤖 ${client.user.tag} está online!`);
        console.log(`📊 Conectado a ${client.guilds.cache.size} servidor(es)`);
        console.log(`👥 Servindo ${client.users.cache.size} usuário(s)`);
        
        // Definir status do bot
        client.user.setActivity('múltiplas funcionalidades | /help', { 
            type: ActivityType.Watching 
        });

        // Auto-deploy de comandos (primeira inicialização)
        try {
            console.log('🔄 Verificando comandos slash...');
            const commands = [];
            const commandsPath = path.join(__dirname, '..', 'commands');
            const commandFolders = fs.readdirSync(commandsPath);

            for (const folder of commandFolders) {
                const folderPath = path.join(commandsPath, folder);
                if (!fs.statSync(folderPath).isDirectory()) continue;
                
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const filePath = path.join(folderPath, file);
                    const command = require(filePath);
                    if ('data' in command && 'execute' in command) {
                        commands.push(command.data.toJSON());
                    }
                }
            }

            const rest = new REST().setToken(process.env.DISCORD_TOKEN);
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            
            console.log(`✅ ${commands.length} comandos registrados com sucesso!`);
        } catch (error) {
            console.error('⚠️ Erro ao registrar comandos (não crítico):', error.message);
            console.log('💡 Use "npm run deploy" manualmente se necessário');
        }
    }
};
