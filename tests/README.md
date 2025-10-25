# 🧪 Testes do Daci Bot

Documentação completa da estrutura de testes do projeto.

## 📁 Estrutura

```
tests/
├── unit/                          # Testes unitários
│   ├── core/                      # Módulos core
│   │   ├── ModelManager.test.js
│   │   └── LanguageTransformer.test.js
│   └── commands/                  # Comandos
│
├── integration/                   # Testes de integração
│
├── fixtures/                      # Dados mock
│   ├── mock-users.js             # Usuários mock
│   └── mock-messages.js          # Mensagens mock
│
└── setup/                        # Configuração
    └── jest.setup.js             # Setup global do Jest
```

## 🚀 Executando Testes

### Todos os testes
```bash
npm test
```

### Testes unitários apenas
```bash
npm run test:unit
```

### Testes de integração
```bash
npm run test:integration
```

### Com cobertura
```bash
npm run test:coverage
```

### Modo watch (desenvolvimento)
```bash
npm run test:watch
```

## 📊 Cobertura de Código

Os testes têm meta de cobertura de **70%** para:
- Branches
- Functions
- Lines
- Statements

Relatório de cobertura é gerado em `coverage/` após rodar `npm run test:coverage`.

## ✍️ Escrevendo Testes

### Exemplo de teste unitário

```javascript
const ModelManager = require('../../../core/models/ModelManager');

describe('ModelManager', () => {
    let modelManager;

    beforeEach(() => {
        modelManager = new ModelManager();
    });

    test('deve inicializar com modelos carregados', () => {
        expect(modelManager.models.length).toBeGreaterThan(0);
    });
});
```

### Usando mocks

```javascript
const { createMockMessage } = require('../../fixtures/mock-messages');

test('deve processar mensagem corretamente', () => {
    const message = createMockMessage('Olá bot!');
    // Seu teste aqui
});
```

## 🔧 Configuração

### jest.config.js
- Ambiente: Node.js
- Timeout: 5 segundos por teste
- Cobertura: ativada por padrão

### jest.setup.js
- Mocks globais do Discord.js
- Variáveis de ambiente de teste
- Cleanup automático

## 📝 Boas Práticas

1. ✅ **Testes isolados**: Cada teste deve ser independente
2. ✅ **Nomes descritivos**: Use `describe` e `test` com nomes claros
3. ✅ **Arrange-Act-Assert**: Organize o código do teste
4. ✅ **Mock externo**: Mock APIs externas (Discord, OpenRouter)
5. ✅ **Cleanup**: Limpe mocks após cada teste

## 🐛 Debug de Testes

### Executar teste específico
```bash
npm test -- ModelManager.test.js
```

### Com logs verbosos
```bash
npm test -- --verbose
```

### Apenas testes falhando
```bash
npm test -- --onlyFailures
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Discord.js Testing Guide](https://discordjs.guide/testing/)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

Para adicionar novos testes, coloque-os na pasta apropriada (`unit/` ou `integration/`) e siga os padrões existentes.

