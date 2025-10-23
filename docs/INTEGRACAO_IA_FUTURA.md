# 🤖 Integração com IA - Guia Futuro

## 📋 Visão Geral

O sistema atual de personalidades utiliza **templates** para gerar respostas. Este documento descreve como integrar **LLMs (GPT/Claude)** para respostas completamente naturais mantendo a consistência de personalidade.

---

## 🏗️ Arquitetura Atual vs Futura

### Atual (Templates)

```
Menção → Carregar Perfil → Calcular Personalidade → 
Escolher Template → Substituir Variáveis → Resposta
```

### Futura (IA)

```
Menção → Carregar Perfil → Calcular Personalidade → 
Construir Prompt → Chamar LLM → Validar Resposta → Enviar
```

---

## 🔌 Ponto de Integração

### Arquivo: `core/ResponseBuilder.js`

**Método atual:**
```javascript
static gerarRespostaTemplate(mensagem, parametrosFinais, estiloResposta, username) {
    const categoria = this.categorizarMensagem(mensagem);
    const mensagemBase = mensagensBase[categoria] || '';
    
    return this.construirResposta(
        mensagemBase, 
        parametrosFinais, 
        estiloResposta, 
        username, 
        categoria
    );
}
```

**Método futuro:**
```javascript
static async gerarRespostaIA(mensagem, parametrosFinais, estiloResposta, username, historico = []) {
    // 1. Construir prompt com contexto de personalidade
    const prompt = this.construirPromptIA(
        mensagem, 
        parametrosFinais, 
        estiloResposta, 
        username,
        historico
    );
    
    // 2. Chamar LLM
    const resposta = await this.chamarLLM(prompt);
    
    // 3. Validar e filtrar resposta
    const respostaFinal = this.validarResposta(resposta, estiloResposta);
    
    return respostaFinal;
}
```

---

## 📝 Construção do Prompt

### Estrutura Recomendada

```javascript
static construirPromptIA(mensagem, parametrosFinais, estiloResposta, username, historico) {
    // 1. Contexto da personalidade do bot
    const contextoBot = `
Você é o Daci, um bot de Discord com a seguinte personalidade base:
- Muito sarcástico (85%)
- Extremamente criativo (90%)
- Gosta de humor negro (75%)
- Muito leal aos amigos (80%)
- Extremamente zoeiro (85%)
- Extrovertido (70%)
    `;
    
    // 2. Contexto do usuário
    const contextoUsuario = `
Você está conversando com ${username}, que possui as seguintes características:
- Sarcasmo: ${(parametrosFinais.sarcasmo * 100).toFixed(0)}%
- Sensibilidade: ${(parametrosFinais.sensibilidade * 100).toFixed(0)}%
- Afinidade com você: ${(parametrosFinais.afinidade * 100).toFixed(0)}%
- Empatia: ${(parametrosFinais.empatia * 100).toFixed(0)}%
- Zoeira: ${(parametrosFinais.zoeira_geral * 100).toFixed(0)}%
    `;
    
    // 3. Personalidade composta resultante
    const contextoRelacao = `
Baseado na fusão de suas personalidades, sua relação com ${username} é:
- Tipo: ${this.traduzirTipoRelacao(estiloResposta.tipoRelacao)}
- Tom emocional: ${estiloResposta.tom}
- Nível de provocação: ${estiloResposta.provocacao}
    `;
    
    // 4. Diretrizes de comportamento
    const diretrizes = this.gerarDiretrizes(parametrosFinais, estiloResposta);
    
    // 5. Histórico recente (últimas 5 mensagens)
    const contextoHistorico = historico.length > 0 
        ? `\n\nHistórico recente:\n${this.formatarHistorico(historico)}`
        : '';
    
    // 6. Mensagem atual
    const mensagemAtual = `\n\n${username}: ${mensagem}\n\nDaci:`;
    
    // Combinar tudo
    return contextoBot + contextoUsuario + contextoRelacao + 
           diretrizes + contextoHistorico + mensagemAtual;
}
```

---

## 🎯 Diretrizes Dinâmicas

### Baseadas nos Parâmetros Finais

```javascript
static gerarDiretrizes(parametrosFinais, estiloResposta) {
    const diretrizes = ['INSTRUÇÕES DE RESPOSTA:'];
    
    // Tom emocional
    if (estiloResposta.tom === 'carinhoso') {
        diretrizes.push('- Use apelidos carinhosos (amor, querido, fofo)');
        diretrizes.push('- Demonstre afeto e cuidado');
        diretrizes.push('- Use emojis calorosos (❤️, 🥰, 💕)');
    } else if (estiloResposta.tom === 'frio') {
        diretrizes.push('- Seja direto e objetivo');
        diretrizes.push('- Evite apelidos ou demonstrações de afeto');
        diretrizes.push('- Use emojis neutros ou evite (😐, ...)');
    }
    
    // Provocação
    if (estiloResposta.provocacao === 'alto') {
        diretrizes.push('- Use bastante ironia e sarcasmo');
        diretrizes.push('- Faça brincadeiras provocativas');
        diretrizes.push('- Use emojis irônicos (😏, 🤭, 😈)');
    } else if (estiloResposta.provocacao === 'baixo') {
        diretrizes.push('- Evite sarcasmo excessivo');
        diretrizes.push('- Seja mais sincero e direto');
    }
    
    // Sensibilidade
    if (parametrosFinais.sensibilidade > 0.7) {
        diretrizes.push('- EVITE humor negro ou pesado');
        diretrizes.push('- Seja mais gentil e compreensivo');
    } else if (parametrosFinais.sensibilidade < 0.3) {
        diretrizes.push('- Pode usar humor mais pesado se apropriado');
        diretrizes.push('- Seja mais direto, sem filtros');
    }
    
    // Espontaneidade
    if (parametrosFinais.espontaneidade > 0.7) {
        diretrizes.push('- Seja espontâneo e natural');
        diretrizes.push('- Use gírias e linguagem informal');
    }
    
    // Regras gerais
    diretrizes.push('\nREGRAS GERAIS:');
    diretrizes.push('- Respostas devem ter NO MÁXIMO 2-3 frases');
    diretrizes.push('- Seja você mesmo (Daci), não seja genérico');
    diretrizes.push('- Adapte-se ao contexto da mensagem');
    diretrizes.push('- Mantenha consistência com mensagens anteriores');
    
    return '\n' + diretrizes.join('\n');
}
```

---

## 🔗 Integração com APIs

### OpenAI (GPT-4)

```javascript
async chamarLLM(prompt) {
    const { Configuration, OpenAIApi } = require('openai');
    
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'Você é o Daci, um bot de Discord divertido e personalizado.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 150,
            temperature: 0.8, // Criatividade
            presence_penalty: 0.3,
            frequency_penalty: 0.3
        });
        
        return response.data.choices[0].message.content.trim();
        
    } catch (error) {
        console.error('Erro ao chamar OpenAI:', error);
        // Fallback para template
        return null;
    }
}
```

### Anthropic (Claude)

```javascript
async chamarLLM(prompt) {
    const Anthropic = require('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    try {
        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 150,
            temperature: 0.8,
            messages: [
                { role: 'user', content: prompt }
            ]
        });
        
        return message.content[0].text.trim();
        
    } catch (error) {
        console.error('Erro ao chamar Claude:', error);
        // Fallback para template
        return null;
    }
}
```

### Google Gemini

```javascript
async chamarLLM(prompt) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
        
    } catch (error) {
        console.error('Erro ao chamar Gemini:', error);
        // Fallback para template
        return null;
    }
}
```

---

## ✅ Validação de Resposta

### Garantir Qualidade e Segurança

```javascript
static validarResposta(resposta, estiloResposta) {
    if (!resposta) return null;
    
    // 1. Remover prefixos indesejados (ex: "Daci:")
    resposta = resposta.replace(/^(Daci|Bot):\s*/i, '');
    
    // 2. Limitar tamanho (Discord limit: 2000 chars)
    if (resposta.length > 500) {
        resposta = resposta.substring(0, 497) + '...';
    }
    
    // 3. Filtrar conteúdo inapropriado
    const palavrasProibidas = ['palavra1', 'palavra2']; // Configure conforme necessário
    for (const palavra of palavrasProibidas) {
        if (resposta.toLowerCase().includes(palavra)) {
            return null; // Rejeitar e usar fallback
        }
    }
    
    // 4. Verificar se resposta é muito genérica
    const respostasGenericas = [
        'como posso ajudar',
        'estou aqui para ajudar',
        'sou apenas um bot'
    ];
    
    for (const generica of respostasGenericas) {
        if (resposta.toLowerCase().includes(generica)) {
            // Marcar para possível regeneração
            console.log('⚠️ Resposta genérica detectada');
        }
    }
    
    return resposta;
}
```

---

## 💾 Sistema de Histórico

### Manter Contexto de Conversa

```javascript
// Em events/messageCreate.js

// Cache de histórico por usuário
const conversationHistory = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.mentions.has(message.client.user)) return;
        
        const userId = message.author.id;
        const guildId = message.guild.id;
        
        // Carregar perfil
        let perfil = UserPersonality.get(userId, guildId);
        const { parametrosFinais, tipoRelacao, estiloResposta } = 
            PersonalityEngine.processarPerfil(perfil);
        
        // Obter histórico (últimas 5 mensagens)
        const userKey = `${guildId}_${userId}`;
        let historico = conversationHistory.get(userKey) || [];
        
        // Remover menção
        const mensagemLimpa = message.content.replace(/<@!?\d+>/g, '').trim();
        
        // Gerar resposta com IA
        const resposta = await ResponseBuilder.gerarRespostaIA(
            mensagemLimpa,
            parametrosFinais,
            estiloResposta,
            message.author.username,
            historico
        );
        
        // Fallback para templates se IA falhar
        const respostaFinal = resposta || ResponseBuilder.gerarRespostaTemplate(
            mensagemLimpa,
            parametrosFinais,
            estiloResposta,
            message.author.username
        );
        
        // Atualizar histórico
        historico.push({
            user: message.author.username,
            message: mensagemLimpa,
            response: respostaFinal,
            timestamp: Date.now()
        });
        
        // Manter apenas últimas 5 interações
        if (historico.length > 5) {
            historico = historico.slice(-5);
        }
        conversationHistory.set(userKey, historico);
        
        // Limpar histórico antigo (> 1 hora)
        setTimeout(() => {
            const now = Date.now();
            for (const [key, hist] of conversationHistory.entries()) {
                if (hist.length > 0 && now - hist[hist.length - 1].timestamp > 3600000) {
                    conversationHistory.delete(key);
                }
            }
        }, 60000); // Verificar a cada 1 minuto
        
        // Resto do código...
        await message.reply(respostaFinal);
        UserPersonality.incrementInteraction(userId, guildId);
    }
};
```

---

## 🎛️ Configuração de Parâmetros da IA

### Ajustes Baseados na Personalidade

```javascript
static getIAConfig(estiloResposta, parametrosFinais) {
    const config = {
        temperature: 0.7,  // Default
        max_tokens: 150,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
    };
    
    // Ajustar criatividade baseado na criatividade do perfil
    config.temperature = 0.5 + (parametrosFinais.criatividade * 0.5);
    // Range: 0.5 (criatividade=0) a 1.0 (criatividade=1)
    
    // Ajustar espontaneidade
    if (parametrosFinais.espontaneidade > 0.7) {
        config.presence_penalty = 0.5; // Mais variado
    }
    
    // Ajustar tamanho baseado na extroversão
    if (parametrosFinais.extroversao > 0.7) {
        config.max_tokens = 200; // Respostas mais longas
    } else if (parametrosFinais.extroversao < 0.3) {
        config.max_tokens = 100; // Respostas mais curtas
    }
    
    return config;
}
```

---

## 📊 Métricas e Monitoramento

### Rastrear Qualidade das Respostas

```javascript
// Adicionar ao log
function logInteractionIA(userId, username, mensagem, resposta, parametros, estilo, iaUsada) {
    const logEntry = `
[${new Date().toISOString()}] USER: ${username} (${userId})
MENSAGEM: ${mensagem}
RESPOSTA: ${resposta}
IA_USADA: ${iaUsada ? 'Sim' : 'Fallback Template'}
PARAMETROS: sarcasmo=${parametros.sarcasmo.toFixed(2)}, afinidade=${parametros.afinidade.toFixed(2)}
ESTILO: ${estilo.tom} (provocacao: ${estilo.provocacao})
${'='.repeat(80)}
`;
    
    fs.appendFileSync(logFile, logEntry, 'utf8');
}
```

---

## 🚀 Implementação Gradual

### Estratégia de Rollout

1. **Fase 1: Testes Internos**
   - Implementar com flag de feature: `USE_AI=true`
   - Testar com owner apenas
   - Comparar respostas IA vs Templates

2. **Fase 2: Beta com Usuários Selecionados**
   - Whitelist de user IDs para usar IA
   - Coletar feedback
   - Ajustar prompts

3. **Fase 3: Rollout Gradual**
   - 10% dos usuários
   - 50% dos usuários
   - 100% dos usuários

4. **Fase 4: Otimização**
   - Cache de respostas similares
   - Ajuste fino de prompts
   - Redução de custos

---

## 💰 Gestão de Custos

### Estratégias para Reduzir Gastos

1. **Cache de Respostas**
   ```javascript
   const respostaCache = new Map();
   const cacheKey = `${mensagemHash}_${perfilHash}`;
   
   if (respostaCache.has(cacheKey)) {
       return respostaCache.get(cacheKey);
   }
   ```

2. **Rate Limiting**
   - Máximo X requisições por usuário por minuto
   - Fallback para templates se exceder

3. **Modelo Híbrido**
   - IA para mensagens complexas/longas
   - Templates para saudações simples

4. **Modelo Local (Opcional)**
   - Usar modelos locais (Llama, Mistral) para reduzir custos
   - Menor qualidade mas sem custos de API

---

## 📝 Checklist de Implementação

- [ ] Instalar SDK da IA escolhida
- [ ] Adicionar API key ao `.env`
- [ ] Implementar `construirPromptIA()`
- [ ] Implementar `chamarLLM()`
- [ ] Implementar `validarResposta()`
- [ ] Adicionar sistema de histórico
- [ ] Implementar fallback para templates
- [ ] Adicionar logging de uso de IA
- [ ] Implementar cache de respostas
- [ ] Configurar rate limiting
- [ ] Testar com diferentes perfis
- [ ] Ajustar prompts baseado em feedback
- [ ] Monitorar custos
- [ ] Otimizar performance

---

## 🎓 Exemplo de Implementação Completa

Ver arquivo separado: `core/ResponseBuilderIA.js` (a ser criado no futuro)

---

**Nota:** Esta integração é **opcional** e o sistema funciona perfeitamente com templates!

**Data:** 23 de Outubro de 2025  
**Versão:** 1.0.0 (Guia Futuro)

