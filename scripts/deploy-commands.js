const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Carregar todos os comandos
function loadCommands() {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`✅ Comando ${command.data.name} carregado para deploy`);
            } else {
                console.log(`❌ Comando em ${filePath} não tem propriedades 'data' ou 'execute'`);
            }
        }
    }
}

// Deploy dos comandos
async function deployCommands() {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`🔄 Iniciando deploy de ${commands.length} comandos...`);

        // Para comandos globais (demora até 1 hora para propagar)
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ ${data.length} comandos registrados globalmente!`);
        console.log('⏰ Os comandos podem demorar até 1 hora para aparecer em todos os servidores.');

    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    loadCommands();
    deployCommands();
}

module.exports = { loadCommands, deployCommands };
