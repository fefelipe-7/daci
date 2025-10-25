/**
 * Testes unitários para ModelManager
 */

const ModelManager = require('../../../core/models/ModelManager');

describe('ModelManager', () => {
    let modelManager;

    beforeEach(() => {
        modelManager = new ModelManager();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Inicialização', () => {
        test('deve inicializar com modelos carregados', () => {
            expect(modelManager).toBeDefined();
            expect(modelManager.models).toBeDefined();
            expect(modelManager.models.length).toBeGreaterThan(0);
        });

        test('deve ter modelos ordenados por prioridade', () => {
            const priorities = modelManager.models.map(m => m.priority);
            const sortedPriorities = [...priorities].sort((a, b) => a - b);
            expect(priorities).toEqual(sortedPriorities);
        });

        test('deve ter pelo menos 8 modelos confirmados', () => {
            const confirmed = modelManager.models.filter(m => m.category === 'confirmed');
            expect(confirmed.length).toBeGreaterThanOrEqual(8);
        });
    });

    describe('selectBestModel()', () => {
        test('deve selecionar modelo com maior prioridade (menor número)', () => {
            const model = modelManager.selectBestModel();
            expect(model).toBeDefined();
            expect(model.priority).toBe(1); // Meta Llama deve ser prioridade 1
            expect(model.name).toContain('meta-llama');
        });

        test('deve retornar apenas modelos ativos', () => {
            // Desativar todos exceto um
            modelManager.models.forEach((m, i) => {
                m.isActive = i === modelManager.models.length - 1;
            });

            const model = modelManager.selectBestModel();
            expect(model).toBeDefined();
            expect(model.isActive).toBe(true);
        });

        test('deve respeitar limite diário', () => {
            // Esgotar limite do primeiro modelo
            const firstModel = modelManager.models[0];
            firstModel.requestsUsed = firstModel.dailyLimit;

            const model = modelManager.selectBestModel();
            expect(model).toBeDefined();
            expect(model.name).not.toBe(firstModel.name);
        });

        test('deve retornar null quando não há modelos disponíveis', () => {
            // Desativar todos os modelos
            modelManager.models.forEach(m => {
                m.isActive = false;
            });

            const model = modelManager.selectBestModel();
            expect(model).toBeNull();
        });
    });

    describe('recordModelUsage()', () => {
        test('deve incrementar contador de uso em sucesso', () => {
            const modelName = modelManager.models[0].name;
            const usageBefore = modelManager.models[0].requestsUsed;

            modelManager.recordModelUsage(modelName, true);

            expect(modelManager.models[0].requestsUsed).toBe(usageBefore + 1);
        });

        test('não deve incrementar em falha', () => {
            const modelName = modelManager.models[0].name;
            const usageBefore = modelManager.models[0].requestsUsed;

            modelManager.recordModelUsage(modelName, false);

            expect(modelManager.models[0].requestsUsed).toBe(usageBefore);
        });

        test('deve lidar com modelo inexistente', () => {
            expect(() => {
                modelManager.recordModelUsage('modelo-invalido', true);
            }).not.toThrow();
        });
    });

    describe('getNextModel()', () => {
        test('deve retornar próximo modelo disponível após falha', () => {
            const firstModel = modelManager.models[0].name;
            const nextModel = modelManager.getNextModel(firstModel);

            expect(nextModel).toBeDefined();
            expect(nextModel.name).not.toBe(firstModel);
        });

        test('deve pular modelos que atingiram limite', () => {
            const firstModel = modelManager.models[0].name;
            
            // Esgotar limite do segundo modelo
            modelManager.models[1].requestsUsed = modelManager.models[1].dailyLimit;

            const nextModel = modelManager.getNextModel(firstModel);
            
            expect(nextModel).toBeDefined();
            expect(nextModel.name).not.toBe(modelManager.models[1].name);
        });

        test('deve retornar null se não há alternativas', () => {
            // Esgotar todos os modelos exceto o primeiro
            modelManager.models.forEach((m, i) => {
                if (i > 0) {
                    m.requestsUsed = m.dailyLimit;
                }
            });

            const firstModel = modelManager.models[0].name;
            const nextModel = modelManager.getNextModel(firstModel);

            expect(nextModel).toBeNull();
        });
    });

    describe('resetDailyLimitsIfNeeded()', () => {
        test('deve resetar limites após 24 horas', () => {
            const model = modelManager.models[0];
            model.requestsUsed = 100;
            model.lastReset = Date.now() - (25 * 60 * 60 * 1000); // 25 horas atrás

            modelManager.resetDailyLimitsIfNeeded();

            expect(model.requestsUsed).toBe(0);
        });

        test('não deve resetar antes de 24 horas', () => {
            const model = modelManager.models[0];
            model.requestsUsed = 50;
            model.lastReset = Date.now() - (12 * 60 * 60 * 1000); // 12 horas atrás

            modelManager.resetDailyLimitsIfNeeded();

            expect(model.requestsUsed).toBe(50);
        });
    });

    describe('getStats()', () => {
        test('deve retornar estatísticas completas', () => {
            const stats = modelManager.getStats();

            expect(stats).toHaveProperty('total');
            expect(stats).toHaveProperty('confirmed');
            expect(stats).toHaveProperty('testing');
            expect(stats).toHaveProperty('active');
            expect(stats).toHaveProperty('available');
            expect(stats).toHaveProperty('models');
        });

        test('total deve ser soma de confirmed + testing', () => {
            const stats = modelManager.getStats();
            expect(stats.total).toBe(stats.confirmed + stats.testing);
        });
    });

    describe('listModels()', () => {
        test('deve listar todos os modelos', () => {
            const models = modelManager.listModels();
            expect(Array.isArray(models)).toBe(true);
            expect(models.length).toBe(modelManager.models.length);
        });

        test('cada modelo deve ter propriedades essenciais', () => {
            const models = modelManager.listModels();
            models.forEach(model => {
                expect(model).toHaveProperty('name');
                expect(model).toHaveProperty('provider');
                expect(model).toHaveProperty('priority');
                expect(model).toHaveProperty('dailyLimit');
                expect(model).toHaveProperty('isActive');
                expect(model).toHaveProperty('category');
            });
        });
    });
});

