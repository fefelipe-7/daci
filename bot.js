// === CRITICAL: Interceptar require ANTES DE QUALQUER IMPORT ===
const Module = require('module');
const originalRequire = Module.prototype.require;
const sodium = require('sodium-javascript');

// Wrapper compatível
const sodiumWrapper = {
    ready: Promise.resolve(),
    crypto_secretbox_KEYBYTES: sodium.crypto_secretbox_KEYBYTES,
    crypto_secretbox_NONCEBYTES: sodium.crypto_secretbox_NONCEBYTES,
    crypto_secretbox_MACBYTES: sodium.crypto_secretbox_MACBYTES,
    crypto_secretbox_easy(message, nonce, key) {
        const cipher = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES);
        sodium.crypto_secretbox_easy(cipher, message, nonce, key);
        return cipher;
    },
    crypto_secretbox_open_easy(ciphertext, nonce, key) {
        const message = Buffer.alloc(ciphertext.length - sodium.crypto_secretbox_MACBYTES);
        const result = sodium.crypto_secretbox_open_easy(message, ciphertext, nonce, key);
        return result ? message : null;
    },
    randombytes_buf(buffer) {
        sodium.randombytes_buf(buffer);
        return buffer;
    }
};

// Interceptar TODOS os requires de sodium
Module.prototype.require = function(id) {
    if (id === 'sodium' || id === 'libsodium' || id === 'libsodium-wrappers' || 
        id === 'sodium-native' || id === '@discordjs/libsodium' || id === 'tweetnacl') {
        console.log(`[SODIUM] Interceptado '${id}' -> usando sodium-javascript`);
        return sodiumWrapper;
    }
    return originalRequire.apply(this, arguments);
};

process.env.FFMPEG_PATH = require('ffmpeg-static');

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

// Todos os eventos são carregados via loadEvents() abaixo

// Carregar comandos e eventos
loadCommands();
loadEvents();

// Login do bot
client.login(process.env.DISCORD_TOKEN);
