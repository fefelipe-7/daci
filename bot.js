const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Carregar configuração
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Configurar intents do Discord
const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
];

// Criar cliente do Discord
const client = new Client({
    intents: intents
});

// Coleção de comandos
client.commands = new Collection();

// Carregar comandos
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        return;
    }

    const commandFolders = fs.readdirSync(commandsPath);
    
    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        // Verificar se é um diretório
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Comando ${command.data.name} carregado!`);
            } else {
                console.log(`❌ Comando em ${filePath} não tem propriedades 'data' ou 'execute'`);
            }
        }
    }
}

// Carregar eventos
function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    
    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        
        console.log(`✅ Evento ${event.name} carregado!`);
    }
}

// Evento quando o bot está pronto
client.once('ready', () => {
    console.log(`🤖 ${client.user.tag} está online!`);
    console.log(`📊 Conectado a ${client.guilds.cache.size} servidor(es)`);
    console.log(`👥 Servindo ${client.users.cache.size} usuário(s)`);
    
    // Definir status do bot
    client.user.setActivity('múltiplas funcionalidades | !help', { 
        type: ActivityType.Watching 
    });
});

// Evento de interação (slash commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: '❌ Houve um erro ao executar este comando!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Evento de mensagem (comandos com prefixo)
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.bot.prefix)) return;

    const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Erro ao executar comando ${commandName}:`, error);
        await message.reply('❌ Houve um erro ao executar este comando!');
    }
});

// Carregar comandos e eventos
loadCommands();
loadEvents();

// Login do bot
client.login(process.env.DISCORD_TOKEN);
