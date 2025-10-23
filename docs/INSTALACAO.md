# 🚀 Instalação Rápida - Bot Multifuncional

## ⚡ Passo a Passo Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp env_example.txt .env

# Edite o arquivo .env com suas informações:
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui  
OWNER_ID=seu_id_de_usuario_aqui
LOG_CHANNEL_ID=id_do_canal_de_logs_aqui
```

### 3. Registrar Comandos Slash
```bash
node deploy-commands.js
```

### 4. Executar o Bot
```bash
npm start
```

## 🔧 Configuração do Discord

### Criar Bot no Discord
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Dê um nome para seu bot
4. Vá em "Bot" → "Add Bot"
5. Copie o **Token** (DISCORD_TOKEN)
6. Copie o **Application ID** (CLIENT_ID)

### Configurar Permissões
1. Vá em "OAuth2" → "URL Generator"
2. Selecione:
   - **Scopes**: `bot`, `applications.commands`
   - **Bot Permissions**: 
     - `Send Messages`
     - `Use Slash Commands`
     - `Kick Members`
     - `Ban Members`
     - `Manage Messages`
     - `Connect` (para música)
     - `Speak` (para música)
     - `Embed Links`
3. Copie a URL gerada e adicione o bot ao seu servidor

### Configurar Canal de Logs
1. Crie um canal chamado "bot-logs" (ou qualquer nome)
2. Copie o ID do canal (botão direito → "Copiar ID")
3. Cole no arquivo .env como LOG_CHANNEL_ID

## ✅ Verificar se Funcionou

1. O bot deve aparecer online no Discord
2. Digite `/help` em qualquer canal
3. Teste alguns comandos:
   - `/userinfo` - Ver suas informações
   - `/serverinfo` - Ver informações do servidor
   - `/meme` - Ver um meme aleatório

## 🐛 Problemas Comuns

### Bot não responde
- Verifique se o token está correto
- Confirme se o bot tem permissões no servidor
- Verifique se o bot está online

### Comandos não aparecem
- Execute `node deploy-commands.js` novamente
- Aguarde até 1 hora (comandos globais)
- Reinicie o bot

### Erro de permissões
- Verifique se o bot tem as permissões necessárias
- Confirme se o canal de logs existe e o bot pode acessá-lo

## 🎮 Comandos Disponíveis

### Moderação
- `/kick @usuário [motivo]` - Expulsa membro
- `/ban @usuário [motivo] [dias]` - Bane membro  
- `/clear <quantidade> [@usuário]` - Limpa mensagens

### Diversão
- `/piada` - Piada interna do grupo
- `/meme` - Meme interno do grupo
- `/gif <palavra>` - Busca GIF
- `/adivinhar <número>` - Jogo de adivinhar
- `/quiz` - Quiz sobre o grupo
- `/8ball <pergunta>` - Bola 8 mágica

### Música
- `/play <URL/nome>` - Toca música
- `/pause` - Pausa música
- `/resume` - Retoma música
- `/skip` - Pula música
- `/stop` - Para reprodução
- `/queue` - Mostra fila
- `/volume <nível>` - Ajusta volume
- `/np` - Música atual

### Utilidades
- `/userinfo [@usuário]` - Info do usuário
- `/serverinfo` - Info do servidor
- `/lembrete <tempo> <mensagem>` - Lembrete pessoal
- `/enquete <pergunta> <opções>` - Cria enquete
- `/stats` - Estatísticas do bot
- `/help [categoria]` - Ajuda categorizada

## 🔄 Atualizações

Para atualizar o bot:
```bash
git pull
npm install
node deploy-commands.js
npm start
```

---

**🎉 Pronto! Seu bot multifuncional está funcionando!**
