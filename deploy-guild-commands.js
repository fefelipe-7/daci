const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Carregar todos os comandos
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
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
                console.log(`✅ Comando ${command.data.name} carregado`);
            }
        }
    }
}

// Deploy dos comandos para um servidor específico
async function deployGuildCommands(guildId) {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`🔄 Registrando ${commands.length} comandos no servidor ${guildId}...`);

        // Para comandos de servidor (instantâneo!)
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands }
        );

        console.log(`✅ ${data.length} comandos registrados no servidor!`);
        console.log('⚡ Comandos disponíveis IMEDIATAMENTE!');

    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
}

// Executar
if (require.main === module) {
    loadCommands();
    
    // Pegar GUILD_ID do argumento ou do .env
    const guildId = process.argv[2] || process.env.GUILD_ID;
    
    if (!guildId) {
        console.error('❌ GUILD_ID não fornecido!');
        console.log('💡 Uso: node deploy-guild-commands.js <GUILD_ID>');
        console.log('💡 Ou adicione GUILD_ID no arquivo .env');
        process.exit(1);
    }
    
    deployGuildCommands(guildId);
}

module.exports = { loadCommands, deployGuildCommands };

