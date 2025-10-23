# 🔄 Sistema Anti-Hibernação - Daci Bot

## 📖 O Que É?

Sistema que mantém o bot **sempre online** no Render (plano gratuito) através de:
1. **Servidor HTTP Express** rodando junto com o bot
2. **Auto-ping interno** a cada 5 minutos
3. **Endpoints de monitoramento** para health check

---

## ⚙️ Como Funciona?

### Arquitetura:

```
┌─────────────────────────────────────────┐
│         BOT DISCORD (bot.js)            │
│  ┌───────────────────────────────────┐  │
│  │   Discord.js Client               │  │
│  │   - Comandos                      │  │
│  │   - Eventos                       │  │
│  │   - Sistema de música             │  │
│  │   - Personalidades                │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │   Servidor HTTP Express           │  │
│  │   - GET  /       (health check)   │  │
│  │   - GET  /ping   (ping simples)   │  │
│  │   - GET  /status (status completo)│  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │   Auto-Ping System                │  │
│  │   - setInterval(5 min)            │  │
│  │   - fetch("/ping")                │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ▲                    │
           │                    │
           │    ┌───────────────▼──────────┐
           │    │  Render.com Platform     │
           │    │  - Detecta atividade     │
           │    │  - Não hiberna o bot     │
           │    └───────────────┬──────────┘
           │                    │
    ┌──────┴────────┐          │
    │  UptimeRobot  │◄─────────┘
    │  (Opcional)   │ Ping externo
    └───────────────┘ a cada 5min
```

---

## 🎯 Problema que Resolve

### Render Free Tier (SEM auto-ping):
```
15:00 - Bot online
15:15 - Sem requests, Render hiberna 💤
15:20 - Usuário tenta usar /play
15:20 - Bot demora 30s pra acordar 😴
15:21 - Música toca (mas demorou muito)
15:36 - Sem requests, Render hiberna de novo 💤
```

### Com Auto-Ping:
```
15:00 - Bot online
15:05 - Auto-ping ✅ (Render: "ainda em uso")
15:10 - Auto-ping ✅ (Render: "ainda em uso")
15:15 - Auto-ping ✅ (Render: "ainda em uso")
15:20 - Usuário usa /play
15:20 - Bot responde INSTANTANEAMENTE 🚀
```

---

## 📊 Endpoints HTTP

### 1. **GET /** - Health Check Básico

**Exemplo:**
```bash
curl https://seu-bot.onrender.com/
```

**Resposta:**
```json
{
  "status": "online",
  "bot": "daci#2981",
  "uptime": "12h 34m",
  "servers": 3,
  "users": 42,
  "timestamp": "2025-10-23T15:30:00.000Z"
}
```

---

### 2. **GET /ping** - Ping Simples

**Exemplo:**
```bash
curl https://seu-bot.onrender.com/ping
```

**Resposta:**
```
pong! 🏓
```

**Uso:** Ideal para UptimeRobot e auto-ping interno.

---

### 3. **GET /status** - Status Detalhado

**Exemplo:**
```bash
curl https://seu-bot.onrender.com/status
```

**Resposta:**
```json
{
  "bot": {
    "username": "daci#2981",
    "id": "1234567890",
    "status": "online"
  },
  "stats": {
    "guilds": 3,
    "users": 42,
    "channels": 87,
    "commands": 38
  },
  "uptime": {
    "seconds": 45360,
    "formatted": "12h 36m 0s"
  },
  "memory": {
    "rss": "128MB",
    "heapUsed": "65MB",
    "heapTotal": "89MB"
  },
  "timestamp": "2025-10-23T15:30:00.000Z"
}
```

**Uso:** Monitoramento detalhado, debugging, dashboards.

---

## 🔧 Código do Auto-Ping

### Localização: `bot.js` (linhas 213-239)

```javascript
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutos

client.once('ready', () => {
    console.log('🔄 Sistema de auto-ping iniciado (intervalo: 5 minutos)');
    
    setInterval(async () => {
        try {
            const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
            const response = await fetch(`${baseUrl}/ping`);
            
            if (response.ok) {
                console.log(`✅ Auto-ping realizado com sucesso [${new Date().toLocaleTimeString('pt-BR')}]`);
            } else {
                console.log(`⚠️ Auto-ping retornou status ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Erro no auto-ping: ${error.message}`);
        }
    }, PING_INTERVAL);
});
```

---

## 🆙 Reforço com Serviço Externo

### Por Que Usar?

1. **Redundância:** Se o auto-ping interno falhar, o externo continua
2. **Render pode detectar:** Auto-ping do próprio IP pode não contar
3. **Monitoramento:** UptimeRobot avisa se o bot cair

### Configurar UptimeRobot:

1. **Acesse:** https://uptimerobot.com
2. **Crie conta gratuita**
3. **Add New Monitor:**
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Daci Bot Render
   URL: https://seu-bot.onrender.com/ping
   Monitoring Interval: 5 minutes
   Alert Contacts: seu_email@exemplo.com
   ```
4. **Save!**

**Benefício:** Você recebe email se o bot cair! 📧

---

## 📈 Logs do Sistema

### O Que Você Verá:

```bash
# Ao iniciar o bot:
🌐 Servidor HTTP rodando na porta 3000
📍 Health check: http://localhost:3000/
🏓 Ping endpoint: http://localhost:3000/ping

# Quando bot estiver pronto:
🔄 Sistema de auto-ping iniciado (intervalo: 5 minutos)

# A cada 5 minutos:
✅ Auto-ping realizado com sucesso [15:05:00]
✅ Auto-ping realizado com sucesso [15:10:00]
✅ Auto-ping realizado com sucesso [15:15:00]
```

### Se Algo Der Errado:

```bash
❌ Erro no auto-ping: fetch failed
```

**Solução:** Verifique se `RENDER_EXTERNAL_URL` está configurado corretamente.

---

## ⚙️ Variáveis de Ambiente

### Obrigatórias:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DISCORD_TOKEN` | Token do bot Discord | `MTIzNDU2Nzg5...` |
| `CLIENT_ID` | ID da aplicação Discord | `1234567890` |
| `OWNER_ID` | Seu Discord User ID | `9876543210` |

### Opcionais (para Render):

| Variável | Descrição | Exemplo | Padrão |
|----------|-----------|---------|--------|
| `PORT` | Porta do servidor HTTP | `10000` | `3000` |
| `RENDER_EXTERNAL_URL` | URL pública do Render | `https://daci-bot.onrender.com` | `http://localhost:3000` |

---

## 🎛️ Configurações Customizáveis

### Alterar Intervalo do Auto-Ping:

**Arquivo:** `bot.js` (linha 216)

```javascript
// Padrão: 5 minutos
const PING_INTERVAL = 5 * 60 * 1000;

// Alterar para 3 minutos:
const PING_INTERVAL = 3 * 60 * 1000;

// Alterar para 10 minutos:
const PING_INTERVAL = 10 * 60 * 1000;
```

⚠️ **Cuidado:** Intervalos muito curtos podem ser detectados como spam.

---

## 📊 Limite de 750 Horas

### Cálculo:

```
1 mês (30 dias) = 720 horas
Render Free Tier = 750 horas/mês
Sobra = 30 horas
```

### Como Monitorar:

1. Acesse o **dashboard do Render**
2. Clique no seu serviço
3. Veja **"Usage"** no menu lateral
4. Gráfico mostra horas consumidas

### Se Estourar o Limite:

**Opções:**
1. Desligar o bot por 1-2 dias no fim do mês
2. Upgrade para **Starter ($7/mês)** = horas ilimitadas
3. Migrar para Railway ($5/mês) ou Oracle Cloud (grátis)

---

## 🔍 Debugging

### Testar Localmente:

```bash
# Terminal 1: Rodar o bot
npm start

# Terminal 2: Testar endpoints
curl http://localhost:3000/
curl http://localhost:3000/ping
curl http://localhost:3000/status
```

### Testar no Render:

```bash
# Substitua pela sua URL real
curl https://seu-bot.onrender.com/ping
```

---

## ✅ Checklist de Funcionamento

- [ ] Servidor HTTP inicia na porta correta
- [ ] Endpoint `/ping` responde "pong! 🏓"
- [ ] Endpoint `/status` retorna JSON com dados do bot
- [ ] Auto-ping executa a cada 5 minutos
- [ ] Logs mostram "✅ Auto-ping realizado com sucesso"
- [ ] Bot não hiberna após 15 minutos
- [ ] (Opcional) UptimeRobot configurado e funcionando

---

## 🚨 Troubleshooting

### Problema: "Cannot find module 'express'"
**Solução:**
```bash
npm install express
```

### Problema: "Port 3000 is already in use"
**Solução:**
- Mude a porta no `.env`: `PORT=3001`
- Ou feche o processo usando a porta

### Problema: Auto-ping não funciona no Render
**Solução:**
1. Certifique-se de que `RENDER_EXTERNAL_URL` está configurado
2. Copie a URL EXATA do Render (com `https://`)
3. Adicione UptimeRobot como backup

### Problema: Bot ainda está hibernando
**Solução:**
1. Verifique os logs para confirmar que auto-ping está rodando
2. Render pode ter mudado políticas (use ping externo)
3. Considere upgrade para plano pago

---

## 💡 Dicas

1. **Use UptimeRobot:** Mesmo com auto-ping interno, é bom ter backup externo
2. **Monitore o uso:** Fique de olho nas 750 horas/mês
3. **Logs são seus amigos:** Sempre verifique se o auto-ping está funcionando
4. **Teste primeiro localmente:** Certifique-se de que o servidor HTTP funciona antes de fazer deploy

---

## 🎉 Conclusão

Com este sistema, seu bot no Render ficará:
- ✅ **Sempre online** (sem hibernação)
- ✅ **Resposta instantânea** (sem delay de 30s)
- ✅ **Monitorável** (endpoints de status)
- ✅ **Grátis** (750h/mês é suficiente)

**Aproveite!** 🔥😎

---

*Última atualização: 23/10/2025*

