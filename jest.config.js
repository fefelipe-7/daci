/**
 * Configuração do Jest para o Daci Bot
 */

module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',

  // Padrão de arquivos de teste
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Diretórios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/docs/',
    '/logs/'
  ],

  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/scripts/',
    '/docs/'
  ],

  // Relatórios de cobertura
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  // Limites de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Arquivos de setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  // Mocks automáticos
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Timeout para testes (5 segundos)
  testTimeout: 5000,

  // Verbose output
  verbose: true,

  // Transformações (se necessário)
  transform: {},

  // Module name mapper (para aliases, se houver)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};

