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

// Inicializar AI Service (se OPENROUTE_KEY configurada)
global.aiService = null;
if (process.env.OPENROUTE_KEY) {
    try {
        const AIService = require('./core/AIService.js');
        global.aiService = new AIService(process.env.OPENROUTE_KEY);
        console.log('✅ AI Service inicializado com sucesso');
        
        // Testar conexão em background
        global.aiService.testConnection().then(result => {
            if (result.success) {
                console.log(`🎉 AI Service pronto! Modelo teste: ${result.model.split('/')[1]}`);
            } else {
                console.warn('⚠️ AI Service com problemas:', result.error);
            }
        }).catch(err => {
            console.warn('⚠️ Teste de IA falhou:', err.message);
        });
    } catch (error) {
        console.error('❌ Erro ao inicializar AI Service:', error.message);
        console.log('💡 O bot vai funcionar normalmente sem IA');
    }
} else {
    console.log('ℹ️ OPENROUTE_KEY não configurada - AI Service desabilitado');
    console.log('💡 Configure OPENROUTE_KEY no .env para ativar respostas com IA');
}

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

// ========================================================================
// SERVIDOR HTTP PARA RENDER (ANTI-HIBERNAÇÃO)
// ========================================================================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint de health check
app.get('/', (req, res) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    res.status(200).json({
        status: 'online',
        bot: client.user ? client.user.tag : 'Conectando...',
        uptime: `${hours}h ${minutes}m`,
        servers: client.guilds.cache.size,
        users: client.users.cache.size,
        timestamp: new Date().toISOString()
    });
});

// Endpoint de ping
app.get('/ping', (req, res) => {
    res.status(200).send('pong! 🏓');
});

// Endpoint de status detalhado
app.get('/status', (req, res) => {
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
        bot: {
            username: client.user ? client.user.tag : 'Conectando...',
            id: client.user ? client.user.id : null,
            status: client.ws.status === 0 ? 'online' : 'offline'
        },
        stats: {
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            channels: client.channels.cache.size,
            commands: client.commands.size
        },
        uptime: {
            seconds: Math.floor(process.uptime()),
            formatted: formatUptime(process.uptime())
        },
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        },
        timestamp: new Date().toISOString()
    });
});

// Helper para formatar uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = [];
    if (days > 0) result.push(`${days}d`);
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0) result.push(`${minutes}m`);
    if (secs > 0 || result.length === 0) result.push(`${secs}s`);
    
    return result.join(' ');
}

// Iniciar servidor HTTP
app.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
    console.log(`🏓 Ping endpoint: http://localhost:${PORT}/ping`);
});

// ========================================================================
// AUTO-PING INTERNO (A CADA 5 MINUTOS)
// ========================================================================
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutos

// Aguardar bot estar pronto antes de iniciar auto-ping
client.once('ready', () => {
    console.log('🔄 Sistema de auto-ping iniciado (intervalo: 5 minutos)');
    
    setInterval(async () => {
        try {
            // Construir URL base
            const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
            
            // Fazer ping interno
            const response = await fetch(`${baseUrl}/ping`);
            
            if (response.ok) {
                console.log(`✅ Auto-ping realizado com sucesso [${new Date().toLocaleTimeString('pt-BR')}]`);
            } else {
                console.log(`⚠️ Auto-ping retornou status ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Erro no auto-ping: ${error.message}`);
        }
    }, PING_INTERVAL);
});
