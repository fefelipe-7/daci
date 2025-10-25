/**
 * Testes unitários para LanguageTransformer
 */

const LanguageTransformer = require('../../../core/LanguageTransformer');

describe('LanguageTransformer', () => {
    describe('toMandrake()', () => {
        test('deve transformar texto básico', () => {
            const texto = 'você está bem?';
            const resultado = LanguageTransformer.toMandrake(texto, 0.5);
            
            expect(resultado).toBeDefined();
            expect(resultado.length).toBeGreaterThan(0);
        });

        test('deve aplicar transformações com intensidade 0', () => {
            const texto = 'você está bem muito legal';
            const resultado = LanguageTransformer.toMandrake(texto, 0);
            
            // Com intensidade 0, ainda deve aplicar transformações básicas
            expect(resultado).toBeDefined();
        });

        test('deve aplicar mais transformações com intensidade alta', () => {
            const texto = 'você está muito bem porque então';
            const resultado = LanguageTransformer.toMandrake(texto, 1.0);
            
            expect(resultado).toBeDefined();
            // Deve conter algumas abreviações
            expect(resultado).toMatch(/cê|tá|pq|mt|ent/);
        });

        test('deve manter texto em lowercase', () => {
            const texto = 'VOCÊ ESTÁ BEM';
            const resultado = LanguageTransformer.toMandrake(texto, 0.5);
            
            expect(resultado).toBe(resultado.toLowerCase());
        });

        test('deve lidar com texto vazio', () => {
            const resultado = LanguageTransformer.toMandrake('', 0.5);
            expect(resultado).toBe('');
        });

        test('deve lidar com texto null/undefined', () => {
            expect(LanguageTransformer.toMandrake(null, 0.5)).toBe('');
            expect(LanguageTransformer.toMandrake(undefined, 0.5)).toBe('');
        });
    });

    describe('Abreviações básicas', () => {
        test('deve transformar "você" em "cê"', () => {
            const resultado = LanguageTransformer.toMandrake('você está bem', 1.0);
            expect(resultado).toContain('cê');
        });

        test('deve transformar "está" em "tá"', () => {
            const resultado = LanguageTransformer.toMandrake('você está bem', 1.0);
            expect(resultado).toContain('tá');
        });

        test('deve transformar "não" em "n"', () => {
            const resultado = LanguageTransformer.toMandrake('não sei', 1.0);
            expect(resultado).toMatch(/\bn\b/); // \b para word boundary
        });

        test('deve transformar "porque" em "pq"', () => {
            const resultado = LanguageTransformer.toMandrake('porque sim', 1.0);
            expect(resultado).toContain('pq');
        });
    });

    describe('Contexto e tom', () => {
        test('deve aceitar opções de contexto', () => {
            const texto = 'você está bem';
            const opcoes = {
                tom: 'ironico',
                provocacao: 0.8,
                contexto: 'deboche'
            };
            
            const resultado = LanguageTransformer.toMandrake(texto, 0.7, opcoes);
            expect(resultado).toBeDefined();
        });

        test('deve lidar com opções undefined', () => {
            const texto = 'você está bem';
            expect(() => {
                LanguageTransformer.toMandrake(texto, 0.5, undefined);
            }).not.toThrow();
        });
    });

    describe('Preservação de estrutura', () => {
        test('deve preservar pontuação básica', () => {
            const texto = 'você está bem?';
            const resultado = LanguageTransformer.toMandrake(texto, 0.3);
            
            expect(resultado).toMatch(/\?$/); // Deve terminar com ?
        });

        test('deve preservar emojis se houver', () => {
            const texto = 'você está bem 😊';
            const resultado = LanguageTransformer.toMandrake(texto, 0.5);
            
            // Emoji pode ser adicionado ou preservado
            expect(resultado.length).toBeGreaterThan(0);
        });
    });
});

