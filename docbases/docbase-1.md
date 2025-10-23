# Sistema de Personalização de Personalidades - Daci Bot

## Visão Geral

O Daci Bot agora possui um sistema avançado de personalização de personalidades que permite interações únicas e dinâmicas com cada membro do servidor. O bot adapta suas respostas baseado em 15 parâmetros psicológicos únicos por usuário.

## Arquitetura

### Camada de Dados
- **`models/UserPersonality.js`**: Gerenciamento de perfis de usuários com SQLite
- **`database/personality.db`**: Banco de dados SQLite (criado automaticamente)

### Camada de Processamento
- **`core/PersonalityEngine.js`**: Motor de cálculo de personalidade composta
  - Fusão ponderada entre personalidade base do bot e perfil do usuário
  - Aplicação de influências cruzadas entre parâmetros
  - Determinação de tipo de relação e estilo de resposta

- **`core/ResponseBuilder.js`**: Construção de respostas personalizadas
  - Sistema de templates baseado em categorias de mensagens
  - Elementos linguísticos por tom (carinhoso, amigável, neutro, frio, hostil, provocador)
  - Categorização automática de mensagens (saudação, pergunta, elogio, provocação, casual)

### Camada de Interação

#### Comandos Admin (apenas OWNER_ID)
- **`/definir <usuario> <parametro> <valor>`**: Configurar parâmetro específico de um usuário
- **`/resetar <usuario>`**: Resetar perfil para valores neutros (0.5)
- **`/listar_perfis`**: Listar todos os perfis customizados do servidor
- **`/debug_personalidade <usuario>`**: Visualizar cálculos internos da personalidade

#### Comandos Públicos
- **`/perfil [usuario]`**: Visualizar perfil de personalidade de qualquer usuário

#### Eventos
- **`events/messageCreate.js`**: Intercepta menções ao bot e gera respostas personalizadas

## 15 Parâmetros Psicológicos

Cada parâmetro varia de 0.0 a 1.0:

1. **🎭 Extroversão**: Nível de energia social e expressividade
2. **😏 Sarcasmo**: Tendência a usar ironia e sarcasmo
3. **🌸 Sensibilidade**: Nível de sensibilidade emocional
4. **👑 Liderança**: Tendência a tomar controle e liderar
5. **💖 Afinidade**: Nível de proximidade com o bot
6. **⚡ Espontaneidade**: Impulsividade e naturalidade
7. **🧘 Paciência**: Tolerância e calma
8. **🎨 Criatividade**: Originalidade e inventividade
9. **🖤 Humor Negro**: Tolerância a humor pesado
10. **💝 Empatia**: Capacidade de compreender emoções alheias
11. **🎉 Zoeira Geral**: Tendência a brincadeiras e zoação
12. **🤝 Lealdade**: Fidelidade e compromisso
13. **💪 Dominância**: Assertividade e controle
14. **✨ Autoestima**: Confiança e autovalorização
15. **🔍 Curiosidade**: Interesse em aprender e explorar

## Personalidade Base do Daci

O bot possui uma personalidade base fixa:

```javascript
{
  sarcasmo: 0.85,       // Naturalmente sarcástico
  criatividade: 0.90,   // Muito criativo
  humor_negro: 0.75,    // Gosta de humor pesado
  lealdade: 0.80,       // Leal aos amigos
  zoeira_geral: 0.85,   // Extremamente zoeiro
  extroversao: 0.70,    // Extrovertido
  // Demais parâmetros em 0.5 (neutros)
}
```

## Pesos Contextuais

A personalidade composta é calculada com pesos diferentes para cada parâmetro:

- **Bot domina** (peso > 0.5): sarcasmo, criatividade, humor_negro, zoeira_geral, extroversao
- **Usuário influencia** (peso < 0.5): sensibilidade, afinidade, paciência, empatia
- **Balanceados** (peso = 0.5): liderança, espontaneidade, lealdade, dominância, autoestima, curiosidade

## Influências Cruzadas

Parâmetros afetam uns aos outros:

- **Alta sensibilidade** → Reduz humor negro e sarcasmo, aumenta empatia
- **Alta afinidade** → Aumenta lealdade, paciência e empatia, reduz sarcasmo
- **Alta liderança** → Aumenta dominância e autoestima, reduz paciência
- **Alta zoeira** → Aumenta espontaneidade e sarcasmo, reduz sensibilidade
- **Alto humor negro** → Aumenta sarcasmo, reduz sensibilidade
- **Alta empatia** → Aumenta paciência e afinidade, reduz dominância

## Tipos de Relação

Baseado nos parâmetros finais, o bot classifica a relação em:

- **🤝😈 Rival Amigável**: Alta afetividade + alta provocação
- **🛡️💕 Protetor**: Alta afetividade + baixa provocação
- **😄😏 Amigável Provocador**: Média afetividade + alta provocação
- **😊👍 Amigável**: Média afetividade + baixa provocação
- **⚔️ Rival**: Baixa afetividade + alta provocação
- **🌫️ Distante**: Baixa afetividade + baixa provocação
- **😐 Neutro**: Valores intermediários

## Estilos de Resposta

### Tom Emocional
- **Carinhoso** (afetividade > 0.7)
- **Amigável** (afetividade > 0.5)
- **Neutro** (afetividade > 0.3)
- **Frio** (afetividade > 0.1)
- **Hostil** (afetividade ≤ 0.1)

### Nível de Provocação
- **Alto** (provocação > 0.7)
- **Moderado** (provocação > 0.4)
- **Baixo** (provocação ≤ 0.4)

## Sistema de Templates

Respostas são geradas via templates que se adaptam aos parâmetros:

### Categorias de Mensagem
1. **Saudação**: "oi", "olá", "e aí", etc.
2. **Pergunta**: Contém "?" ou palavras interrogativas
3. **Elogio**: "obrigado", "valeu", "legal", etc.
4. **Provocação**: Keywords negativas ou desafiadoras
5. **Casual**: Qualquer outra mensagem
6. **Fallback**: Quando não há template adequado

### Elementos Linguísticos

Cada tom possui:
- **Prefixos**: "Ei", "Opa", "Fala", etc.
- **Sufixos**: Emojis variados
- **Apelidos**: "amor", "mano", "brother", etc.
- **Intensificadores**: "super", "muito", "demais", etc.
- **Ironias/Sarcasmos**: Palavras irônicas como "genial", "brilhante"

## Logging

Todas as interações são registradas em `logs/personality_interactions.log`:

```
[2024-01-23T10:30:00.000Z] USER: Near (123456789)
MENSAGEM: e aí bot, tudo certo?
RESPOSTA: E aí amor! Tudo certo? 🥰
PARAMETROS: sarcasmo=0.87, afinidade=0.51, empatia=0.42
ESTILO: carinhoso (provocacao: moderado)
```

## Fluxo de Interação

1. Usuário menciona o bot
2. Sistema carrega perfil do usuário (cria se não existe)
3. `PersonalityEngine` calcula personalidade composta
4. Aplica influências cruzadas
5. Determina tipo de relação e estilo de resposta
6. `ResponseBuilder` categoriza a mensagem
7. Escolhe template adequado baseado em condições
8. Substitui variáveis (username, apelidos, emojis)
9. Aplica sarcasmo extra se necessário
10. Incrementa contador de interações
11. Registra no log
12. Envia resposta

## Scripts Utilitários

### Seed de Perfis de Teste

```bash
node scripts/seed_personalities.js <GUILD_ID> <NEAR_ID> <REST_ID> <PURE_ID>
```

Cria perfis pré-configurados:
- **Near**: Provocador e sarcástico (sarcasmo=0.90, zoeira=0.95, sensibilidade=0.20)
- **Rest**: Similar ao Near (sarcasmo=0.90, zoeira=0.90)
- **Pure**: Sensível e afetivo (sensibilidade=0.90, afinidade=0.90, empatia=0.95)
- **Neutro**: Todos os parâmetros em 0.5

## Deploy de Comandos

Registrar os novos comandos:

```bash
# Global (leva até 1h para aplicar)
node deploy-commands.js

# Por servidor (instantâneo)
node deploy-guild-commands.js <GUILD_ID>
```

## Integração Futura com IA

O `ResponseBuilder` está preparado para integração com LLMs (GPT/Claude). No futuro, o método `gerarRespostaTemplate()` será substituído por uma chamada à API de IA, passando:

- Mensagem do usuário
- Parâmetros finais da personalidade composta
- Estilo de resposta
- Tipo de relação
- Histórico de interações

Isso permitirá respostas completamente naturais e contextualizadas mantendo a consistência de personalidade.

## Próximos Passos (Não Implementados)

- **Memória Emocional**: Sistema de eventos que ajustam parâmetros automaticamente
- **Evolução de Relação**: Parâmetros que mudam com base no histórico de interações
- **Comandos de Auto-ajuste**: Permitir usuários ajustarem seus próprios parâmetros
- **Analytics**: Dashboard de estatísticas de personalidades por servidor

---

**Data de Implementação**: 23 de Outubro de 2025  
**Versão**: 1.0.0

