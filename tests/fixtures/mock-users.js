/**
 * Mock de usuários para testes
 */

module.exports = {
    mockUser: {
        id: '123456789',
        username: 'TestUser',
        discriminator: '1234',
        tag: 'TestUser#1234',
        bot: false,
        avatar: null
    },

    mockBotUser: {
        id: '987654321',
        username: 'DaciBot',
        discriminator: '0001',
        tag: 'DaciBot#0001',
        bot: true,
        avatar: null
    },

    mockAdminUser: {
        id: '111222333',
        username: 'AdminUser',
        discriminator: '9999',
        tag: 'AdminUser#9999',
        bot: false,
        avatar: null,
        permissions: {
            has: jest.fn().mockReturnValue(true)
        }
    }
};

