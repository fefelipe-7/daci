/**
 * Setup global do Jest para o Daci Bot
 */

// Aumentar timeout para testes que podem demorar
jest.setTimeout(10000);

// Mock do console para testes mais limpos (opcional)
global.console = {
    ...console,
    error: jest.fn(), // Mock console.error
    warn: jest.fn()   // Mock console.warn
    // log, info, debug permanecem funcionais
};

// Mock de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.DISCORD_TOKEN = 'test_token_12345';
process.env.OPENROUTE_KEY = 'test_openrouter_key';
process.env.CLIENT_ID = '123456789';

// Desabilitar logs durante testes
process.env.LOG_LEVEL = 'error';

// Mock global para Discord.js (se necessário)
jest.mock('discord.js', () => ({
    Client: jest.fn(),
    GatewayIntentBits: {},
    Partials: {},
    REST: jest.fn(),
    Routes: {},
    EmbedBuilder: jest.fn(),
    ActionRowBuilder: jest.fn(),
    ButtonBuilder: jest.fn(),
    ButtonStyle: {}
}));

// Cleanup após todos os testes
afterAll(() => {
    jest.clearAllMocks();
});

