/**
 * Mock de mensagens do Discord para testes
 */

const { mockUser, mockBotUser } = require('./mock-users');

const createMockMessage = (content, author = mockUser, options = {}) => ({
    content,
    author,
    channel: {
        id: options.channelId || '999888777',
        name: options.channelName || 'test-channel',
        send: jest.fn().mockResolvedValue({}),
        messages: {
            fetch: jest.fn().mockResolvedValue([])
        }
    },
    guild: {
        id: options.guildId || '444555666',
        name: options.guildName || 'Test Guild',
        members: {
            fetch: jest.fn()
        }
    },
    member: {
        id: author.id,
        user: author,
        permissions: {
            has: jest.fn().mockReturnValue(options.hasPermissions !== false)
        },
        roles: {
            cache: new Map()
        }
    },
    reply: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    react: jest.fn().mockResolvedValue({}),
    mentions: {
        users: new Map(),
        members: new Map()
    },
    createdTimestamp: Date.now(),
    id: options.messageId || String(Math.random())
});

module.exports = {
    createMockMessage,
    
    mockUserMessage: createMockMessage('Olá bot!', mockUser),
    
    mockBotMessage: createMockMessage('Resposta do bot', mockBotUser),
    
    mockCommandMessage: createMockMessage('/help', mockUser),
    
    mockMentionMessage: (mentionedUser) => createMockMessage(
        `<@${mentionedUser.id}> olá!`,
        mockUser,
        { mentions: { users: new Map([[mentionedUser.id, mentionedUser]]) } }
    )
};

