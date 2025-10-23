# 🔧 Guia de Configuração - Bot Multifuncional

## ✅ Dependências Instaladas

Todas as dependências foram instaladas com sucesso:
- ✅ discord.js@14.23.2
- ✅ better-sqlite3@9.6.0
- ✅ dotenv@16.6.1
- ✅ @discordjs/voice@0.16.1
- ✅ ytdl-core@4.11.5
- ✅ E outras dependências necessárias

## 🔑 Configuração das Variáveis de Ambiente

### 1. Criar arquivo .env
Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
DISCORD_TOKEN=seu_token_do_discord_aqui
CLIENT_ID=seu_client_id_aqui
OWNER_ID=seu_id_de_usuario_aqui
LOG_CHANNEL_ID=id_do_canal_de_logs_aqui
```

### 2. Como conseguir cada token:

#### 🤖 DISCORD_TOKEN
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application" ou selecione uma existente
3. Vá em "Bot" no menu lateral
4. Clique em "Add Bot" se necessário
5. Em "Token", clique em "Copy"
6. Cole no arquivo .env

#### 🆔 CLIENT_ID
1. No mesmo portal, vá em "General Information"
2. Copie o "Application ID"
3. Cole no arquivo .env

#### 👤 OWNER_ID
1. No Discord, ative o "Modo Desenvolvedor":
   - Configurações → Avançado → Modo Desenvolvedor
2. Clique com botão direito no seu nome/avatar
3. Selecione "Copiar ID"
4. Cole no arquivo .env

#### 📝 LOG_CHANNEL_ID (Opcional)
1. Crie um canal chamado "bot-logs" no seu servidor
2. Clique com botão direito no canal
3. Selecione "Copiar ID"
4. Cole no arquivo .env

### 3. Configurar Permissões do Bot

1. No Discord Developer Portal, vá em "OAuth2" → "URL Generator"
2. Selecione:
   - **Scopes**: `bot`, `applications.commands`
   - **Bot Permissions**:
     - Send Messages
     - Use Slash Commands
     - Kick Members
     - Ban Members
     - Manage Messages
     - Moderate Members
     - Connect (para música)
     - Speak (para música)
     - Embed Links
     - Read Message History
3. Copie a URL gerada e adicione o bot ao seu servidor

## 🚀 Próximos Passos

Após configurar o arquivo .env:

```bash
# 1. Registrar comandos slash
node deploy-commands.js

# 2. Iniciar o bot
npm start
```

## ✅ Verificar se Funcionou

1. O bot deve aparecer online no Discord
2. Digite `/help` em qualquer canal
3. Teste alguns comandos:
   - `/userinfo` - Ver suas informações
   - `/serverinfo` - Ver informações do servidor
   - `/piada` - Ver uma piada interna

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
- Confirme se o canal de logs existe

## 📞 Suporte

Se precisar de ajuda, verifique:
1. Se todas as variáveis estão configuradas
2. Se o bot tem as permissões necessárias
3. Se os comandos foram registrados corretamente

---

**🎉 Bot configurado com sucesso!**

