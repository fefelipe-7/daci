/**
 * Configuração do ESLint para o Daci Bot
 */

module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'commonjs'
  },
  rules: {
    // Possíveis erros
    'no-console': 'off', // Permitido para logs
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Boas práticas
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',

    // Estilo de código
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'never'],
    'indent': ['error', 4, { SwitchCase: 1 }],

    // Node.js específico
    'no-process-exit': 'off',
    'global-require': 'off'
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        'no-unused-expressions': 'off'
      }
    }
  ]
};

