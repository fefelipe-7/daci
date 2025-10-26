# 📁 Estrutura do Projeto Daci Bot

Documentação completa da organização de arquivos e diretórios do projeto.

## 🗂️ Estrutura de Diretórios

```
daci/
├── 📄 Arquivos Principais
│   ├── bot.js                    # Entry point principal do bot
│   ├── package.json              # Dependências e scripts NPM
│   ├── config.json               # Configurações principais
│   └── jest.config.js            # Configuração de testes
│
├── 📖 Documentação (Raiz)
│   ├── README.md                 # Documentação principal
│   ├── CHANGELOG.md              # Histórico de versões
│   ├── CONTRIBUTING.md           # Guia de contribuição
│   ├── CODE_OF_CONDUCT.md        # Código de conduta
│   ├── SECURITY.md               # Política de segurança
│   └── LICENSE                   # Licença MIT
│
├── 🧠 core/                      # Módulos principais do bot
│   ├── memory/                   # Sistema de memória (RAM + SQLite)
│   ├── models/                   # Gerenciamento de modelos IA
│   ├── personality/              # Sistema de personalidades
│   ├── prompt/                   # Construção de prompts
│   ├── response/                 # Geração de respostas
│   ├── templates/                # Templates de mensagens
│   ├── Preprocessor.js           # Camada de pré-processamento
│   ├── Processor.js              # Camada de processamento IA
│   ├── Postprocessor.js          # Camada de pós-processamento
│   ├── LanguageTransformer.js    # Transformação "mandrake"
│   ├── ContextBuilder.js         # Construção de contexto
│   ├── EntityRecognizer.js       # Reconhecimento de entidades
│   ├── IntentDetector.js         # Detecção de intenção
│   └── ...                       # Outros módulos core
│
├── 💬 commands/                  # Comandos do Discord
│   ├── fun/                      # Comandos de diversão
│   ├── moderation/               # Comandos de moderação
│   ├── music/                    # Comandos de música
│   ├── personality/              # Comandos de personalidade
│   └── utils/                    # Comandos utilitários
│
├── 🎭 events/                    # Event handlers do Discord
│   ├── messageCreate.js          # Handler de mensagens
│   ├── interactionCreate.js      # Handler de interações
│   └── ready.js                  # Handler de inicialização
│
├── 🎵 music/                     # Sistema de música
│   ├── MusicPlayer.js            # Player principal
│   ├── MusicQueue.js             # Sistema de fila
│   ├── PlatformDetector.js       # Detecção de plataforma
│   └── ...
│
├── 💾 database/                  # Banco de dados SQLite
│   ├── database.js               # Gerenciador do DB
│   └── personality.db            # Banco de personalidades
│
├── 👤 models/                    # Modelos de dados
│   └── UserPersonality.js        # Modelo de personalidade
│
├── 👥 profiles/                  # Perfis de personalidade
│   ├── near.json                 # Perfil Near
│   ├── rest.json                 # Perfil Rest
│   ├── tim.json                  # Perfil Tim
│   ├── vic.json                  # Perfil Vic
│   └── ...
│
├── 🛠️ scripts/                  # Scripts utilitários
│   ├── deploy-commands.js        # Deploy de comandos
│   ├── setup.js                  # Setup inicial
│   ├── seed_personalities.js     # Seed de personalidades
│   └── ...
│
├── 📚 docs/                      # Documentação técnica
│   ├── DEPLOY_GITHUB.md          # Deploy via GitHub
│   ├── QUICKSTART.md             # Guia de início rápido
│   ├── PRE_DEPLOY_CHECKLIST.md   # Checklist de deploy
│   ├── SISTEMA_IA.md             # Documentação do sistema IA
│   ├── PERSONALIDADES_GUIA.md    # Guia de personalidades
│   └── ...                       # Outros guias técnicos
│
├── 📝 docbases/                  # Base de conhecimento
│   ├── docbase-1.md              # Documentação interna
│   └── docbase-2-linguagem-mandrake.md
│
├── 🤖 .github/                   # GitHub Actions
│   └── workflows/                # CI/CD workflows
│       └── ci.yml                # Lint e Build Check
│
├── 📊 logs/                      # Logs do bot
│   └── personality_interactions.log
│
└── 🔧 Arquivos de Configuração (Dot Files)
    ├── .env                      # Variáveis de ambiente
    ├── .gitignore                # Git ignore
    ├── .gitattributes            # Git attributes
    ├── .eslintrc.js              # ESLint config (básico)
    └── .eslintignore             # ESLint ignore
```

## 🎯 Princípios de Organização

### ✅ Arquivos na Raiz
Apenas arquivos essenciais e documentação principal:
- **Entry point**: `bot.js`
- **Configurações principais**: `package.json`, `config.json`
- **Documentação oficial**: README, CONTRIBUTING, SECURITY, etc.
- **Dot files**: Configurações básicas (`.eslintrc.js`, `.gitignore`, etc.)

### 📁 Diretórios Principais

#### `core/` - Lógica Principal
Contém toda a lógica core do bot, organizada em submódulos:
- **Arquitetura em 3 camadas**: Preprocessor → Processor → Postprocessor
- **Módulos especializados**: memory/, models/, personality/, prompt/, response/, templates/
- **Componentes auxiliares**: LanguageTransformer, ContextBuilder, etc.

#### `commands/` - Comandos do Discord
Comandos organizados por categoria:
- `fun/` - Entretenimento
- `moderation/` - Moderação
- `music/` - Sistema de música
- `personality/` - Personalidades
- `utils/` - Utilitários

#### `docs/` - Documentação Técnica
Guias técnicos e documentação de desenvolvimento:
- Guias de deploy
- Documentação de sistemas
- Checklists
- Tutoriais

## 📝 Convenções

### Nomenclatura de Arquivos
- **PascalCase**: Classes e componentes principais (`ModelManager.js`, `LanguageTransformer.js`)
- **camelCase**: Utilitários e helpers (`database.js`, `ready.js`)
- **kebab-case**: Scripts (`deploy-commands.js`)
- **SCREAMING_SNAKE_CASE**: Documentação principal (`README.md`, `CODE_OF_CONDUCT.md`)

### Importação de Módulos
```javascript
// Core modules
const ModelManager = require('./core/models/ModelManager');
const MemoryManager = require('./core/memory/MemoryManager');

// Commands
const banCommand = require('./commands/moderation/ban');

// Utils
const logger = require('./core/Logger');
```

## 🔄 Fluxo de Dados

```
Discord Message
      ↓
events/messageCreate.js
      ↓
core/Preprocessor.js (coleta dados + contexto)
      ↓
core/Processor.js (chama IA)
      ↓
core/Postprocessor.js (valida + estiliza)
      ↓
Discord Response
```

## 📦 Módulos Principais

### Sistema de Memória
```
core/memory/
├── ShortTermMemory.js    # RAM (Map)
├── LongTermMemory.js     # SQLite
├── MemoryManager.js      # Orquestrador
└── ...
```

### Sistema de IA
```
core/models/
├── ModelRegistry.js      # Lista de modelos
├── ModelSelector.js      # Seleção + fallback
└── ModelManager.js       # Orquestrador
```

### Sistema de Personalidades
```
core/personality/
├── BehaviorRules.js      # Regras de comportamento
├── VocabularyData.js     # Vocabulário
├── DaciPersonality.js    # Orquestrador
└── ...
```

## 🚀 Para Desenvolvedores

### Adicionar Novo Comando
1. Criar arquivo em `commands/{categoria}/novocomando.js`
2. Seguir estrutura padrão (SlashCommandBuilder)
3. Registrar no `commands/` loader

### Adicionar Novo Módulo Core
1. Criar arquivo em `core/` ou submódulo apropriado
2. Exportar como CommonJS (`module.exports`)
3. Documentar com JSDoc

## 📖 Documentação Relacionada

- [README.md](README.md) - Visão geral do projeto
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guia de contribuição
- [docs/](docs/) - Documentação técnica completa

---

**Última atualização**: Outubro 2025  
**Versão**: 2.0.0

Para mais informações, consulte a documentação completa em [docs/](docs/).

