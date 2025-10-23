# 🚀 Guia de Deploy no Render.com

## 📋 Visão Geral

Este bot foi configurado com **sistema anti-hibernação** para funcionar no plano gratuito do Render.

### ✨ Recursos Implementados:
- ✅ Servidor HTTP Express (endpoints `/`, `/ping`, `/status`)
- ✅ Auto-ping interno a cada 5 minutos
- ✅ Health check com informações do bot
- ✅ Status detalhado com uso de memória e estatísticas
- ✅ Compatível com UptimeRobot/Cron-job.org

---

## 🎯 Passo a Passo - Deploy no Render

### 1. **Criar Conta no Render**
- Acesse: https://render.com
- Clique em **"Get Started"**
- Faça login com **GitHub**

### 2. **Criar Novo Web Service**
- No dashboard, clique em **"New +"**
- Selecione **"Web Service"**

### 3. **Conectar Repositório GitHub**
- Procure por **`fefelipe-7/daci`**
- Clique em **"Connect"**

### 4. **Configurar o Serviço**

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `daci-bot` (ou qualquer nome) |
| **Region** | Escolha o mais próximo (ex: `Oregon (US West)`) |
| **Branch** | `main` |
| **Root Directory** | (deixe vazio) |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 5. **Adicionar Variáveis de Ambiente**

Clique em **"Advanced"** e adicione:

```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
OWNER_ID=seu_owner_id_aqui
PORT=10000
```

⚠️ **Importante:** O Render define `PORT` automaticamente, mas adicione como backup.

### 6. **Obter URL do Render**

Após o deploy, você receberá uma URL tipo:
```
https://daci-bot-xxxx.onrender.com
```

### 7. **Adicionar URL nas Variáveis** (Opcional mas Recomendado)

Volte em **Environment** e adicione:
```
RENDER_EXTERNAL_URL=https://daci-bot-xxxx.onrender.com
```

*(Substitua pela sua URL real)*

### 8. **Deploy!**

- Clique em **"Create Web Service"**
- Aguarde o build (~5-10 minutos)
- Bot ficará online! 🎉

---

## 🔄 Sistema de Auto-Ping

### Como Funciona:

1. **Servidor HTTP** roda na porta 10000 (ou a que o Render definir)
2. **Auto-ping interno** executa a cada **5 minutos**
3. Bot faz request para `RENDER_EXTERNAL_URL/ping`
4. Render considera isso como "atividade" e **não hiberna**

### Endpoints Disponíveis:

| Endpoint | Descrição | Exemplo |
|----------|-----------|---------|
| `/` | Health check básico | `GET https://seu-bot.onrender.com/` |
| `/ping` | Ping simples | `GET https://seu-bot.onrender.com/ping` |
| `/status` | Status detalhado | `GET https://seu-bot.onrender.com/status` |

### Exemplo de Resposta (`/status`):

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
    "seconds": 86400,
    "formatted": "1d 0h 0m 0s"
  },
  "memory": {
    "rss": "128MB",
    "heapUsed": "65MB",
    "heapTotal": "89MB"
  },
  "timestamp": "2025-10-23T15:30:00.000Z"
}
```

---

## 🆙 Reforço com UptimeRobot (RECOMENDADO)

Para **garantir 100%** que o bot não hiberne, use um serviço externo:

### Opção 1: **UptimeRobot** (Grátis)

1. Acesse: https://uptimerobot.com
2. Crie uma conta grátis
3. Clique em **"Add New Monitor"**
4. Configure:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Daci Bot
   URL: https://seu-bot.onrender.com/ping
   Monitoring Interval: 5 minutes
   ```
5. Salve!

### Opção 2: **Cron-job.org** (Grátis)

1. Acesse: https://cron-job.org
2. Crie uma conta
3. Clique em **"Create cronjob"**
4. Configure:
   ```
   Title: Daci Bot Ping
   URL: https://seu-bot.onrender.com/ping
   Schedule: */5 * * * * (a cada 5 minutos)
   ```
5. Salve!

---

## ⚠️ Limitações do Plano Gratuito

### Render Free Tier:
- ✅ **750 horas/mês** (suficiente para 24/7 com 30h de sobra)
- ⚠️ **Hiberna após 15 min sem requests** (resolvido com auto-ping)
- ⚠️ **Quando hiberna, perde estado** (fila de música é resetada)
- ⚠️ **Latência aumentada** no primeiro request após acordar (~10-30s)

### Cálculo de Horas:

```
1 mês = 30 dias × 24h = 720 horas
Render Free = 750 horas/mês
Sobra = 30 horas (1.25 dias)
```

**Dica:** Monitore o uso no dashboard do Render!

---

## 🎛️ Monitoramento

### Ver Logs em Tempo Real:
1. Acesse o dashboard do Render
2. Clique no seu serviço
3. Vá em **"Logs"**
4. Você verá:
   ```
   🌐 Servidor HTTP rodando na porta 10000
   🔄 Sistema de auto-ping iniciado (intervalo: 5 minutos)
   ✅ Auto-ping realizado com sucesso [15:35:00]
   ```

### Verificar Status:
Acesse no navegador:
```
https://seu-bot.onrender.com/status
```

---

## 🔧 Troubleshooting

### ❌ Bot não está respondendo
1. Verifique os logs no dashboard
2. Confirme que `DISCORD_TOKEN` está correto
3. Verifique se o bot tem permissões no Discord

### ❌ Auto-ping não funciona
1. Certifique-se de que `RENDER_EXTERNAL_URL` está configurado
2. Verifique se a URL está correta (copie direto do Render)
3. Olhe os logs para mensagens de erro

### ❌ Bot está hibernando mesmo com auto-ping
1. Adicione UptimeRobot (ping externo)
2. Verifique se o bot realmente está fazendo os auto-pings (olhe os logs)
3. Render pode ter mudado as políticas (considere upgrade para plano pago)

### ❌ "Cannot find module 'express'"
1. Render não instalou as dependências
2. Force um rebuild: **"Manual Deploy" → "Clear build cache & deploy"**

---

## 💰 Quando Considerar o Plano Pago?

### Plano **Starter ($7/mês)**:
- ✅ Bot **NUNCA hiberna**
- ✅ **Ilimitado** em horas
- ✅ Processo **sempre rodando**
- ✅ Melhor para **uso em produção**
- ✅ Sistema de música **nunca quebra**

### Vale a pena se:
- ❌ Auto-ping não está funcionando bem
- ❌ Bot está sendo usado por muitas pessoas
- ❌ Você cansou de monitorar o limite de 750h
- ❌ Sistema de música está quebrando constantemente

---

## 📊 Alternativas ao Render

Se o Render não funcionar bem para você:

| Serviço | Custo | Uptime | Complexidade |
|---------|-------|--------|--------------|
| **Railway.app** | R$ 25/mês | 99.9% | Baixa |
| **Fly.io** | Grátis* | 99.9% | Média |
| **DigitalOcean** | R$ 25/mês | 99.9% | Alta |
| **Oracle Cloud** | **GRÁTIS** | 99.9% | **Muito Alta** |

*Fly.io tem limite de 160GB-hours/mês no plano grátis

---

## ✅ Checklist de Deploy

- [ ] Conta criada no Render
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas (`DISCORD_TOKEN`, `CLIENT_ID`, `OWNER_ID`)
- [ ] `RENDER_EXTERNAL_URL` adicionada (com a URL real do Render)
- [ ] Deploy realizado com sucesso
- [ ] Bot está online no Discord
- [ ] Servidor HTTP funcionando (testar `/ping`)
- [ ] Auto-ping ativo (verificar logs)
- [ ] (Opcional) UptimeRobot configurado
- [ ] (Opcional) Comandos registrados com `/deploy-commands.js`

---

## 🎉 Pronto!

Seu bot está rodando no Render com **sistema anti-hibernação ativo**! 🔥

**Próximos passos:**
1. Teste o bot no Discord
2. Monitore os logs nas primeiras horas
3. Configure UptimeRobot para reforçar
4. Aproveite! 😎

---

**Dúvidas?** Verifique a documentação oficial: https://render.com/docs

*Última atualização: 23/10/2025*

