# 🤖 Sistema de IA - DACI Bot

Sistema completo de Inteligência Artificial integrado com OpenRouter para gerar respostas personalizadas e dinâmicas.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Configuração](#configuração)
- [Modelos Disponíveis](#modelos-disponíveis)
- [Como Funciona](#como-funciona)
- [Comandos](#comandos)
- [Exemplos de Uso](#exemplos-de-uso)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de IA do DACI Bot transforma respostas fixas em **respostas dinâmicas e personalizadas** geradas por modelos de IA, mantendo a personalidade única do bot e respeitando os perfis individuais de cada usuário.

### **Principais Recursos:**

✅ **18 modelos gratuitos** do OpenRouter  
✅ **Fallback automático** entre modelos  
✅ **Priorização inteligente** de modelos  
✅ **Limites diários** gerenciados automaticamente  
✅ **Respostas personalizadas** por usuário  
✅ **Integração com perfis** de personalidade  
✅ **Templates como guia de estilo**  
✅ **Monitoramento e estatísticas**  

---

## 🏗️ Arquitetura

### **3 Módulos Principais:**

```
┌─────────────────────────────────────────────┐
│           AIService (Principal)              │
│  • Gerencia comunicação com API             │
│  • Coordena fallback entre modelos          │
│  • Cache e otimizações                      │
└───────────────┬─────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
┌───────▼───────┐  ┌────▼──────────┐
│ ModelManager  │  │ PromptBuilder │
│ • 18 modelos  │  │ • Contexto    │
│ • Prioridades │  │ • Perfis      │
│ • Limites     │  │ • Estilo      │
└───────────────┘  └───────────────┘
```

### **1. AIService** (`core/AIService.js`)
- Serviço principal que coordena tudo
- Faz chamadas à API OpenRouter
- Gerencia fallback automático
- Mantém estatísticas de uso

### **2. ModelManager** (`core/ModelManager.js`)
- Gerencia 18 modelos gratuitos
- Sistema de prioridades (1-17)
- Limites diários por modelo
- Reset automático a cada 24h
- Fallback inteligente

### **3. PromptBuilder** (`core/PromptBuilder.js`)
- Constrói prompts contextualizados
- Integra perfis de personalidade
- Transforma templates em guias de estilo
- Ajusta temperatura por usuário

---

## ⚙️ Configuração

### **1. Obter Chave da API**

1. Acesse: https://openrouter.ai/
2. Crie uma conta (gratuita)
3. Vá em **Keys** e crie uma nova chave
4. Copie a chave (começa com `sk-or-v1-...`)

### **2. Configurar no Projeto**

**Localmente:**
```bash
# Edite o arquivo .env
OPENROUTE_KEY=sk-or-v1-sua-chave-aqui
```

**No Render:**
1. Dashboard > seu serviço
2. Environment
3. Adicionar variável:
   - Name: `OPENROUTE_KEY`
   - Value: `sk-or-v1-sua-chave-aqui`

### **3. Reiniciar Bot**

O AI Service é inicializado automaticamente quando o bot inicia.

```
Logs esperados:
✅ AI Service inicializado com sucesso
🧪 Testando conexão com OpenRouter...
✅ Conexão com OpenRouter OK
🎉 AI Service pronto! Modelo teste: llama-3.3-8b-instruct
```

---

## 📦 Modelos Disponíveis

### **Modelos Confirmados (Funcionando) - 8 modelos**

| Prioridade | Modelo | Limite Diário | Descrição |
|------------|--------|---------------|-----------|
| **1** ⭐ | `meta-llama/llama-3.3-8b-instruct:free` | 1500 | **PRIORIDADE MÁXIMA** - Mais recente Meta |
| **2** ⭐ | `nvidia/nemotron-nano-9b-v2:free` | 2000 | NVIDIA otimizado para conversação |
| **3** ⭐ | `deepseek/deepseek-chat-v3.1:free` | 1500 | Excelente para diálogos |
| **4** ⭐ | `moonshotai/kimi-dev-72b:free` | 800 | Versão de desenvolvimento |
| **5** ⭐ | `mistralai/mistral-small-3.2-24b:free` | 1200 | Modelo francês eficiente |
| 6 | `qwen/qwen3-coder:free` | 1000 | Especializado em programação |
| 7 | `dolphin-mistral-24b-venice:free` | 800 | Modelo fine-tuned |
| 8 | `google/gemma-3n-e2b-it:free` | 1000 | Google otimizado |

### **Modelos em Teste - 10 modelos**

Modelos adicionais para fallback e testes (prioridades 9-18).

**Total: 18 modelos gratuitos!** 🎉

---

## 🔄 Como Funciona

### **1. Usuário Envia Mensagem**

```
Pure: "oi daci!"
```

### **2. Bot Carrega Perfil**

```javascript
{
  username: "pure",
  apelido: "Pure",
  parametros: {
    afinidade: 1.00,  // Favorita!
    sarcasmo: 0.05,   // Quase zero
    sensibilidade: 0.80
  },
  comportamento_bot: {
    tom: "doce e carinhoso",
    exemplos: ["purezinha 💖", "ai que fofa 🥺"]
  }
}
```

### **3. PromptBuilder Cria Contexto**

```
SISTEMA:
Você é o Daci Bot.
Identidade: carismático, informal, perspicaz

PERFIL DO USUÁRIO ATUAL:
- Nome: Pure
- Afinidade: 1.00 (EXTREMA - sua pessoa favorita)
- Sarcasmo: 0.05 (EVITE sarcasmo - seja gentil)
- Sensibilidade: 0.80 (Pessoa MUITO sensível - seja cuidadoso)

QUANDO ELA FOR GENTIL:
- Tom: derretido e encantado
- Exemplos: "purezinha 💖", "ai que fofa 🥺"

GUIA DE ESTILO:
- Use linguagem natural, coloquial
- Seja conciso (1-2 frases)
- Com essa pessoa: use diminutivos, seja carinhoso

MENSAGEM:
"oi daci!"
```

### **4. ModelManager Seleciona Modelo**

```
1. Verifica modelo prioritário (llama-3.3-8b)
2. Checa se está dentro do limite (1234/1500)
3. Usa esse modelo ✅
```

### **5. AIService Gera Resposta**

```javascript
OpenRouter API → Modelo processa → Gera resposta

Resposta: "oi purezinha! 💖 como cê tá? que bom te ver aqui"
```

### **6. Bot Envia Resposta**

```
DACI: "oi purezinha! 💖 como cê tá? que bom te ver aqui"
```

---

## 🎮 Comandos

### **/teste_ia** `<mensagem>`
Testa o serviço de IA com sua personalidade.

**Exemplo:**
```
/teste_ia mensagem: como você está?
```

**Retorna:**
- Sua mensagem
- Resposta da IA
- Seu perfil
- Tempo de resposta
- Modelo usado

---

### **/ia_stats**
Mostra estatísticas do serviço de IA.

**Informações:**
- Total de requisições
- Taxa de sucesso
- Tempo médio de resposta
- Modelos mais usados
- Status dos modelos

---

### **/ia_modelos** `[categoria]`
Lista todos os modelos disponíveis.

**Categorias:**
- `confirmed` - Modelos confirmados
- `testing` - Modelos em teste
- `all` - Todos (padrão)

**Mostra:**
- Nome do modelo
- Descrição
- Prioridade
- Uso atual
- Status (ativo/limite)

---

## 💡 Exemplos de Uso

### **Exemplo 1: Pure (Favorita)**

**Entrada:** "estou triste hoje"

**Contexto Enviado:**
- Afinidade: 1.00
- Sensibilidade: 0.80
- Tom: doce e carinhoso

**Resposta Gerada:**
```
"ai purezinha 🥺 o que aconteceu? quer conversar sobre isso? 
tô aqui pra ti"
```

---

### **Exemplo 2: Madu (Gado Rancoroso)**

**Entrada:** "oi"

**Contexto Enviado:**
- Afinidade: 0.65
- Autoestima dela: 0.90
- Quando gentil: derrete com emojis

**Resposta Gerada:**
```
"madu 😳 olha quem apareceu... tô até sem palavras aqui"
```

**Se ela ignorar depois:**

**Entrada:** *[sem resposta]*

**Contexto:** quando_rejeita = defensivo

**Resposta:**
```
"nem queria falar contigo mesmo 🙄"
```

---

### **Exemplo 3: Usuário Padrão**

**Entrada:** "explica como funciona o comando de música"

**Contexto Enviado:**
- Perfil padrão
- Afinidade: 0.5
- Sarcasmo: 0.5

**Resposta Gerada:**
```
"opa! é só usar /play e o nome da música ou link do youtube/spotify. 
aí o bot toca pra galera, simples assim"
```

---

## 🔧 Fallback Automático

### **Cenário de Fallback:**

1. **Modelo 1** (llama-3.3-8b) → Limite atingido ❌
2. **Modelo 2** (nemotron) → Tenta automaticamente ✅
3. Resposta gerada com sucesso

**Logs:**
```
⚠️ Modelo llama-3.3-8b-instruct atingiu limite diário (1500)
🔄 Fallback: llama-3.3-8b-instruct → nemotron-nano-9b-v2
✅ Resposta gerada em 1247ms
```

### **Se Todos Falharem:**

Resposta de fallback criativa:
```
"pô, deu um bug aqui, não consegui processar direito"
```

---

## 📊 Estatísticas

### **Exemplo de Output `/ia_stats`:**

```
🤖 REQUISIÇÕES DE IA
Total: 1,247
Sucesso: 1,198
Falhas: 49
Taxa de Sucesso: 96.1%

⏱️ PERFORMANCE
Tempo Médio: 1,234ms

📦 MODELOS
Total: 18
Ativos: 15
Requisições: 1,247

🏆 TOP 5 MAIS USADOS
1. llama-3.3-8b: 456/1500
2. nemotron-nano: 301/2000
3. deepseek-chat: 198/1500
4. mistral-small: 142/1200
5. kimi-dev: 89/800
```

---

## 🐛 Troubleshooting

### **"AI Service não inicializado"**

**Causa:** OPENROUTE_KEY não configurada

**Solução:**
```bash
# Adicione no .env
OPENROUTE_KEY=sk-or-v1-sua-chave-aqui

# Reinicie o bot
```

---

### **"Todos os modelos atingiram limite"**

**Causa:** Uso intenso em 24h

**Solução:**
- Aguarde reset automático (24h)
- Ou modelo prioritário será resetado automaticamente

---

### **"Resposta vazia ou inválida"**

**Causa:** Modelo retornou resposta mal-formada

**Solução:**
- Sistema tenta próximo modelo automaticamente
- Se persistir, verifica conexão com OpenRouter

---

### **"OpenRouter API error: 401"**

**Causa:** Chave inválida ou expirada

**Solução:**
1. Verifique se a chave está correta
2. Gere nova chave em https://openrouter.ai/keys
3. Atualize no .env
4. Reinicie o bot

---

### **"Connection timeout"**

**Causa:** Problema de rede ou API lenta

**Solução:**
- Timeout configurado para 30s
- Sistema tenta próximo modelo
- Verifica conexão com internet

---

## 🎯 Boas Práticas

### **1. Usar Perfis Personalizados**
Configure perfis detalhados para usuários frequentes (Pure, Madu, etc.)

### **2. Monitorar Uso**
Use `/ia_stats` regularmente para ver uso dos modelos

### **3. Testar Mudanças**
Use `/teste_ia` antes de alterar perfis

### **4. Respeitar Limites**
Sistema gerencia automaticamente, mas monitore uso

### **5. Backup de Respostas**
Sistema tem fallback automático para frases prontas

---

## 🚀 Performance

### **Métricas Típicas:**

- **Tempo de resposta:** 800ms - 2000ms
- **Taxa de sucesso:** 95%+
- **Requisições/dia:** Ilimitadas (com fallback)
- **Modelos disponíveis:** 18
- **Limite total combinado:** ~20,000 requisições/dia

---

## 📚 Referências

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Perfis de Personalidade](./PERSONALIDADES_GUIA.md)
- [Linguagem Mandrake](./GUIA_LINGUAGEM_MANDRAKE.md)

---

**🎉 Sistema de IA implementado com sucesso!**

Agora o DACI Bot tem respostas dinâmicas e personalizadas para cada usuário! 🤖✨

