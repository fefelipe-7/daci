/**
 * Configuração básica do ESLint para o Daci Bot
 */

module.exports = {
    env: {
        node: true,
        es2021: true
    },
    extends: ['eslint:recommended'],
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
        'prefer-const': 'warn',

        // Estilo básico
        'semi': ['error', 'always'],
        'quotes': ['warn', 'single', { avoidEscape: true }]
    }
};
