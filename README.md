# 🤖 Bot Multifuncional para Discord

Um bot completo que substitui Lawliet, Mudae, Loritta, ZeroTwo e Jockei Music em uma única solução modular e escalável.

## ✨ Funcionalidades

### 🛡️ Moderação
- **Kick/Ban**: Expulsar e banir membros com logs
- **Limpeza**: Deletar mensagens em massa
- **Logs**: Sistema completo de logs de moderação

### 🎉 Diversão e Entretenimento
- **Piadas Internas**: Piadas personalizadas do grupo
- **Memes Internos**: Banco de memes do grupo
- **GIFs**: Busca de GIFs com termos internos
- **Jogos**: Quiz sobre o grupo, adivinhar números
- **Bola 8**: Respostas aleatórias para perguntas

### 🎵 Música (Sistema Completo - Estilo Jockie Music)
- **Multi-plataforma**: Spotify, YouTube, SoundCloud
- **Sistema Híbrido**: Spotify extrai metadados + busca YouTube
- **Fila Avançada**: Loop, shuffle, votação para skip
- **Controles Completos**: Play, pause, resume, skip, stop, volume
- **Botões Interativos**: Controles via botões no Discord
- **Busca Inteligente**: Por nome ou URL

### 🔧 Utilidades
- **Userinfo**: Informações detalhadas de usuários
- **Serverinfo**: Informações do servidor
- **Help**: Sistema de ajuda categorizado

## 🚀 Instalação

### Pré-requisitos
- Node.js 16.9.0 ou superior
- npm ou yarn
- Token do Discord Bot

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd discord-multifunctional-bot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp env_example.txt .env

# Edite o arquivo .env com suas informações
DISCORD_TOKEN=seu_token_aqui
OWNER_ID=seu_id_aqui
LOG_CHANNEL_ID=id_do_canal_de_logs
```

4. **Configure o bot no Discord**
- Acesse [Discord Developer Portal](https://discord.com/developers/applications)
- Crie uma nova aplicação
- Vá em "Bot" e copie o token
- Em "OAuth2 > URL Generator", selecione:
  - Scopes: `bot`, `applications.commands`
  - Bot Permissions: `Administrator` (ou permissões específicas)

5. **Execute o bot**
```bash
npm start
```

## ⚙️ Configuração

### Arquivo config.json
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
    "gacha": { "enabled": true },
    "fun": { "enabled": true },
    "music": { "enabled": true },
    "utils": { "enabled": true }
  }
}
```

### Permissões Necessárias
- **Moderação**: `Kick Members`, `Ban Members`, `Manage Messages`
- **Música**: `Connect`, `Speak`, `Use Voice Activity`
- **Geral**: `Send Messages`, `Use Slash Commands`, `Embed Links`

## 📁 Estrutura do Projeto

```
discord-multifunctional-bot/
├── bot.js                 # Arquivo principal
├── config.json           # Configurações
├── package.json          # Dependências
├── commands/             # Comandos slash
│   ├── moderation/       # Comandos de moderação
│   ├── gacha/           # Sistema de gacha
│   ├── fun/             # Comandos de diversão
│   ├── music/           # Sistema de música
│   └── utils/           # Utilidades
├── events/              # Eventos do Discord
├── database/             # Sistema de banco de dados
└── README.md            # Este arquivo
```

## 🎮 Comandos Principais

### Moderação
- `/kick @usuário [motivo]` - Expulsa um membro
- `/ban @usuário [motivo] [dias]` - Bane um membro
- `/clear <quantidade> [@usuário]` - Limpa mensagens

### Diversão
- `/piada` - Piada interna do grupo
- `/meme` - Meme interno do grupo
- `/gif <palavra>` - Busca GIF com palavra-chave
- `/adivinhar <número>` - Jogo de adivinhar (1-10)
- `/quiz` - Pergunta sobre o grupo
- `/8ball <pergunta>` - Bola 8 mágica

### Música (Sistema Completo)
- `/play <URL/nome>` - Toca de Spotify, YouTube, SoundCloud ou busca
- `/pause` - Pausa música
- `/resume` - Retoma música pausada
- `/skip` - Pula música (votação se >2 pessoas)
- `/stop` - Para toda reprodução e limpa fila
- `/queue [página]` - Mostra fila com paginação
- `/volume <0-100>` - Ajusta volume
- `/loop <off/song/queue>` - Loop música ou fila
- `/shuffle` - Embaralha fila
- `/np` - Mostra música atual com detalhes

**📖 Guia completo:** Veja [MUSICA.md](MUSICA.md) para mais detalhes

### Utilidades
- `/userinfo [@usuário]` - Informações do usuário
- `/serverinfo` - Informações do servidor
- `/lembrete <tempo> <mensagem>` - Cria lembrete pessoal
- `/enquete <pergunta> <opções>` - Cria enquete no canal
- `/stats` - Estatísticas do bot
- `/help [categoria]` - Ajuda categorizada

## 🔧 Desenvolvimento

### Adicionando Novos Comandos
1. Crie um arquivo na pasta `commands/categoria/`
2. Use a estrutura:
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nome')
        .setDescription('Descrição'),
    
    async execute(interaction) {
        // Lógica do comando
    }
};
```

### Adicionando Novos Eventos
1. Crie um arquivo na pasta `events/`
2. Use a estrutura:
```javascript
module.exports = {
    name: 'nomeDoEvento',
    async execute(...args) {
        // Lógica do evento
    }
};
```

## 🐛 Solução de Problemas

### Bot não responde
- Verifique se o token está correto
- Confirme se as permissões estão configuradas
- Verifique se o bot está online

### Comandos não aparecem
- Execute `/help` para verificar se os comandos foram registrados
- Reinicie o bot se necessário

### Erro de permissões
- Verifique se o bot tem as permissões necessárias
- Confirme se o canal de logs existe

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato.

---

**Desenvolvido com ❤️ para substituir múltiplos bots em um só!**
