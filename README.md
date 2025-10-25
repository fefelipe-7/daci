# 🤖 DACI - Discord Bot Multifuncional

Um bot completo e modular para Discord com **sistema de personalidades dinâmicas**, **música multi-plataforma** e comandos de **moderação**, **diversão** e **utilidades**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.9.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/Security-Policy-red.svg)](SECURITY.md)

## ✨ Funcionalidades Principais

### 🎭 Sistema de Personalidades
- **Personalidades Dinâmicas**: Cada usuário pode ter sua própria personalidade customizada
- **Linguagem Mandrake**: Sistema de transformação de mensagens com gírias e expressões únicas
- **Apelidos Personalizados**: Sistema de apelidos para mencionar outros usuários
- **Perfis Predefinidos**: 8+ perfis prontos (Near, Rest, Tim, Vic, Pure, Madu, Peu, PH)
- **Configuração Flexível**: Defina tons, estilos e vocabulários personalizados

### 🎵 Sistema de Música (Multi-plataforma)
- **Plataformas Suportadas**: Spotify, YouTube, SoundCloud
- **Busca Inteligente**: Por nome ou URL direta
- **Controles Completos**: Play, pause, resume, skip, stop, volume
- **Fila Avançada**: Loop (música/fila), shuffle, paginação
- **Sistema de Votação**: Skip por votação quando há múltiplos usuários
- **Botões Interativos**: Interface com botões do Discord

### 🛡️ Moderação
- **Kick/Ban**: Expulsar e banir membros
- **Mute/Unmute**: Sistema de silenciamento
- **Warn**: Sistema de avisos
- **Clear**: Limpeza de mensagens em massa
- **Logs**: Sistema completo de registro de ações

### 🎉 Diversão
- **Piadas e Memes**: Banco de piadas e memes internos
- **GIFs**: Busca de GIFs com termos personalizados
- **Quiz**: Perguntas sobre o grupo
- **Adivinhar**: Jogo de adivinhar números
- **8ball**: Bola 8 mágica para perguntas

### 🔧 Utilidades
- **UserInfo/ServerInfo**: Informações detalhadas
- **Enquetes**: Sistema de votação
- **Lembretes**: Lembretes pessoais
- **Stats**: Estatísticas do bot
- **Help**: Sistema de ajuda categorizado

## 🚀 Instalação Rápida

### Pré-requisitos
- **Node.js** 16.9.0 ou superior
- **npm** ou **yarn**
- **Token do Discord Bot** ([Discord Developer Portal](https://discord.com/developers/applications))

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/daci-discord-bot.git
cd daci-discord-bot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas informações:
```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
OWNER_ID=seu_id_aqui
LOG_CHANNEL_ID=id_do_canal_de_logs
```

4. **Execute o setup inicial**
```bash
npm run setup
```

5. **Registre os comandos**
```bash
npm run deploy
```

6. **Inicie o bot**
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
daci-discord-bot/
├── bot.js                    # Arquivo principal do bot
├── config.json              # Configurações do bot
├── package.json             # Dependências e scripts
├── .env.example             # Exemplo de variáveis de ambiente
├── LICENSE                  # Licença MIT
│
├── commands/                # Comandos slash organizados
│   ├── fun/                # Comandos de diversão
│   ├── moderation/         # Comandos de moderação
│   ├── music/              # Sistema de música
│   ├── personality/        # Comandos de personalidade
│   └── utils/              # Utilidades
│
├── core/                    # Núcleo do sistema
│   ├── DaciPersonality.js  # Sistema de personalidades
│   ├── LanguageTransformer.js # Transformador de linguagem
│   ├── MessageTemplates.js # Templates de mensagens
│   ├── PersonalityEngine.js # Engine de personalidades
│   ├── ResponseBuilder.js  # Construtor de respostas
│   └── UserNicknames.js    # Sistema de apelidos
│
├── database/                # Sistema de banco de dados
│   └── database.js         # Configuração SQLite
│
├── events/                  # Event handlers do Discord
│   ├── ready.js            # Evento de inicialização
│   ├── interactionCreate.js # Comandos slash
│   └── messageCreate.js    # Mensagens regulares
│
├── models/                  # Modelos de dados
│   └── UserPersonality.js  # Modelo de personalidade
│
├── music/                   # Sistema de música modular
│   ├── MusicPlayer.js      # Player de música
│   ├── MusicProcessor.js   # Processador de áudio
│   ├── MusicQueue.js       # Gerenciador de fila
│   ├── PlatformDetector.js # Detector de plataformas
│   └── QueueManager.js     # Gerenciador global de filas
│
├── profiles/                # Perfis de personalidade predefinidos
│   ├── near.json
│   ├── rest.json
│   ├── tim.json
│   └── ... (outros perfis)
│
├── scripts/                 # Scripts utilitários
│   ├── deploy-commands.js  # Deploy de comandos globais
│   ├── deploy-guild-commands.js # Deploy de comandos em servidor
│   ├── setup.js            # Setup inicial
│   └── ... (outros scripts)
│
├── docs/                    # Documentação completa
│   ├── INSTALACAO.md       # Guia de instalação detalhado
│   ├── MUSICA.md           # Documentação do sistema de música
│   ├── PERSONALIDADES_GUIA.md # Guia de personalidades
│   ├── GUIA_LINGUAGEM_MANDRAKE.md # Guia da linguagem
│   └── ... (outras documentações)
│
└── docbases/                # Base de conhecimento
    ├── docbase-1.md        # Contexto do projeto
    └── docbase-2-linguagem-mandrake.md
```

## 🎮 Comandos Principais

### 🎭 Personalidades
- `/perfil [usuário]` - Ver perfil de personalidade
- `/definir` - Definir sua personalidade customizada
- `/listar_perfis` - Ver perfis predefinidos disponíveis
- `/resetar` - Resetar personalidade para padrão
- `/debug_personalidade [usuário]` - Debug de personalidade

### 🎵 Música
- `/play <música>` - Tocar música (Spotify/YouTube/SoundCloud)
- `/pause` - Pausar música
- `/resume` - Retomar música
- `/skip` - Pular música (votação automática)
- `/stop` - Parar e limpar fila
- `/queue [página]` - Ver fila de músicas
- `/volume <0-100>` - Ajustar volume
- `/loop <off/song/queue>` - Configurar loop
- `/shuffle` - Embaralhar fila
- `/np` - Ver música atual

### 🛡️ Moderação
- `/kick @usuário [motivo]` - Expulsar membro
- `/ban @usuário [motivo]` - Banir membro
- `/mute @usuário <tempo> [motivo]` - Silenciar membro
- `/unmute @usuário` - Remover silêncio
- `/warn @usuário [motivo]` - Avisar membro
- `/clear <quantidade>` - Limpar mensagens

### 🎉 Diversão
- `/piada` - Piada aleatória
- `/meme` - Meme aleatório
- `/gif <termo>` - Buscar GIF
- `/quiz` - Quiz sobre o grupo
- `/adivinhar <número>` - Adivinhar número (1-10)
- `/8ball <pergunta>` - Bola 8 mágica

### 🔧 Utilidades
- `/userinfo [@usuário]` - Informações do usuário
- `/serverinfo` - Informações do servidor
- `/enquete <pergunta> <opções>` - Criar enquete
- `/lembrete <tempo> <mensagem>` - Criar lembrete
- `/stats` - Estatísticas do bot
- `/help [categoria]` - Ajuda detalhada

## ⚙️ Configuração

### config.json
```json
{
  "bot": {
    "prefix": "!",
    "token": "SEU_TOKEN_AQUI",
    "ownerId": "SEU_ID_AQUI",
    "logChannelId": "ID_DO_CANAL_DE_LOGS"
  },
  "modules": {
    "moderation": { "enabled": true },
    "fun": { "enabled": true },
    "music": { "enabled": true, "defaultVolume": 0.5 },
    "utils": { "enabled": true }
  }
}
```

### Permissões Necessárias
O bot precisa das seguintes permissões no Discord:
- `Send Messages` - Enviar mensagens
- `Use Slash Commands` - Usar comandos slash
- `Embed Links` - Enviar embeds
- `Manage Messages` - Gerenciar mensagens (moderação)
- `Kick Members` - Expulsar membros
- `Ban Members` - Banir membros
- `Connect` - Conectar a canais de voz
- `Speak` - Falar em canais de voz
- `Use Voice Activity` - Usar atividade de voz

## 📖 Documentação Completa

Para guias detalhados, consulte a pasta [`docs/`](docs/):
- **[Instalação Detalhada](docs/INSTALACAO.md)** - Guia completo de instalação
- **[Sistema de Música](docs/MUSICA.md)** - Documentação do sistema de música
- **[Personalidades](docs/PERSONALIDADES_GUIA.md)** - Como usar personalidades
- **[Linguagem Mandrake](docs/GUIA_LINGUAGEM_MANDRAKE.md)** - Guia da linguagem
- **[Deploy no Render](docs/DEPLOY_RENDER.md)** - Deploy em produção

## 🔧 Desenvolvimento

### Adicionando Novos Comandos

1. Crie um arquivo em `commands/categoria/`:
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comando')
        .setDescription('Descrição do comando'),
    
    async execute(interaction) {
        await interaction.reply('Resposta!');
    }
};
```

2. Execute `npm run deploy` para registrar o comando

### Scripts Disponíveis
```bash
npm start              # Iniciar bot em produção
npm run dev            # Iniciar com auto-reload
npm run deploy         # Deploy de comandos globais
npm run deploy:guild   # Deploy de comandos em servidor específico
npm run setup          # Setup inicial do banco de dados
```

## 🐛 Solução de Problemas

### Bot não conecta
- Verifique se o token está correto no `.env`
- Confirme que as intents estão habilitadas no Developer Portal

### Comandos não aparecem
- Execute `npm run deploy` para registrar os comandos
- Aguarde até 1 hora para propagação global
- Use `npm run deploy:guild` para testes imediatos

### Música não toca
- Verifique se o bot tem permissões de voz
- Confirme que o FFmpeg está instalado
- Verifique a conexão de internet

Para mais ajuda, consulte a [documentação completa](docs/) ou abra uma issue.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

**Leia nosso [Guia de Contribuição](CONTRIBUTING.md) e [Código de Conduta](CODE_OF_CONDUCT.md)** antes de contribuir.

## 🔒 Segurança

A segurança é uma prioridade. Se você descobrir uma vulnerabilidade:

- **NÃO** abra uma issue pública
- Reporte de forma privada seguindo nossa [Política de Segurança](SECURITY.md)
- Aguarde a confirmação da equipe antes de divulgar publicamente

Para mais informações sobre práticas de segurança, consulte [SECURITY.md](SECURITY.md).

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Felipe Ferreira**

## 🙏 Agradecimentos

- Comunidade Discord.js
- Todos os contribuidores do projeto
- Usuários e testadores do bot

## 📚 Documentação Adicional

- 📖 [Guia de Contribuição](CONTRIBUTING.md) - Como contribuir para o projeto
- 📜 [Código de Conduta](CODE_OF_CONDUCT.md) - Nossas diretrizes de comunidade
- 🔒 [Política de Segurança](SECURITY.md) - Como reportar vulnerabilidades
- 📝 [Changelog](CHANGELOG.md) - Histórico de versões e mudanças
- 🚀 [Guia de Deploy](DEPLOY_GITHUB.md) - Deploy no Render via GitHub

---

**Desenvolvido com ❤️ para criar a melhor experiência em servidores Discord!**

Para suporte, dúvidas ou sugestões, abra uma [issue](https://github.com/fefelipe-7/daci/issues) no GitHub.
