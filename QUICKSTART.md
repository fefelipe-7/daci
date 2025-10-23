# 🚀 Início Rápido - DACI Discord Bot

Bem-vindo ao DACI! Este guia vai te ajudar a colocar o bot online em **menos de 5 minutos**.

## ⚡ Setup Ultra Rápido

### 1️⃣ Instalar Dependências (1 minuto)
```bash
cd daci
npm install
```

### 2️⃣ Configurar Variáveis (2 minutos)

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite `.env` e adicione suas credenciais:
```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
OWNER_ID=seu_id_aqui
```

**Onde conseguir essas informações?**
- Acesse: https://discord.com/developers/applications
- Crie uma aplicação ou use uma existente
- **DISCORD_TOKEN**: Bot > Token > Reset Token
- **CLIENT_ID**: OAuth2 > Client ID
- **OWNER_ID**: Seu ID do Discord (ative Modo Desenvolvedor > Clique com botão direito no seu perfil > Copiar ID)

### 3️⃣ Registrar Comandos (30 segundos)
```bash
npm run deploy
```

### 4️⃣ Iniciar Bot (10 segundos)
```bash
npm start
```

**Pronto! Bot online! 🎉**

---

## 🧪 Testar o Bot

No seu servidor Discord, tente:

```
/help
/play never gonna give you up
/perfil
/userinfo
/8ball Vai dar tudo certo?
```

---

## 📚 Para Desenvolvedores

### Modo Desenvolvimento (Auto-reload)
```bash
npm run dev
```

### Deploy de Comandos em Servidor Específico (Mais Rápido)
```bash
# Configure GUILD_ID no .env primeiro
npm run deploy:guild
```

### Ver Scripts Disponíveis
```bash
npm run
```

---

## 🐙 Deploy no GitHub

### Opção 1: Script Automático (Recomendado)
```powershell
# Windows (PowerShell)
.\scripts\git-setup.ps1
```

```bash
# Linux/Mac
bash scripts/git-setup.sh
```

### Opção 2: Manual

1. **Inicializar Git**
```bash
git init
git add .
git commit -m "🎉 feat: versão 2.0.0 - inicial"
```

2. **Criar repositório no GitHub**: https://github.com/new

3. **Push**
```bash
git remote add origin https://github.com/SEU-USUARIO/daci-discord-bot.git
git branch -M main
git push -u origin main
```

**Veja mais detalhes em:** `DEPLOY_GITHUB.md`

---

## 🌐 Deploy em Produção (Render)

1. Crie conta no Render: https://render.com
2. New > Web Service
3. Conecte seu repositório GitHub
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Adicione as variáveis do `.env`
5. Deploy!

**Guia completo:** `docs/DEPLOY_RENDER.md`

---

## 📖 Documentação Completa

- **[README.md](README.md)** - Visão geral completa
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Como contribuir
- **[docs/INSTALACAO.md](docs/INSTALACAO.md)** - Instalação detalhada
- **[docs/MUSICA.md](docs/MUSICA.md)** - Sistema de música
- **[docs/PERSONALIDADES_GUIA.md](docs/PERSONALIDADES_GUIA.md)** - Personalidades
- **[PRE_DEPLOY_CHECKLIST.md](PRE_DEPLOY_CHECKLIST.md)** - Checklist completo

---

## 🆘 Problemas Comuns

### Bot não inicia
```
❌ Erro: "Error: Used disallowed intents"
```
**Solução**: Ative as Intents no Discord Developer Portal
- Bot > Privileged Gateway Intents
- ✅ MESSAGE CONTENT INTENT
- ✅ SERVER MEMBERS INTENT

### Comandos não aparecem
```
❌ Comandos slash não aparecem
```
**Solução**: Execute `npm run deploy` e aguarde até 1 hora para propagação global
- Para testes: Use `npm run deploy:guild` (instantâneo)

### Música não toca
```
❌ Erro ao tocar música
```
**Solução**: Verifique se o bot tem permissões:
- ✅ Connect
- ✅ Speak
- ✅ Use Voice Activity

---

## 🎯 Próximos Passos

Após o bot estar online:

1. ✅ Teste todos os comandos
2. ✅ Configure personalidades customizadas (`/definir`)
3. ✅ Adicione piadas e memes personalizados
4. ✅ Configure permissões de moderação
5. ✅ Faça backup do banco de dados regularmente
6. ✅ Monitore logs de erros

---

## 🤝 Comunidade e Suporte

- **Issues**: https://github.com/seu-usuario/daci-discord-bot/issues
- **Discussions**: https://github.com/seu-usuario/daci-discord-bot/discussions
- **Contribuir**: Veja `CONTRIBUTING.md`

---

## 📊 Status do Projeto

```
✅ Sistema de Personalidades
✅ Sistema de Música Multi-plataforma
✅ Comandos de Moderação
✅ Comandos de Diversão
✅ Comandos de Utilidades
✅ Banco de Dados SQLite
✅ Event Handlers
✅ Documentação Completa
```

---

**Divirta-se com seu bot! 🤖✨**

*Desenvolvido com ❤️ para a melhor experiência Discord*

