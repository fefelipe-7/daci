# 🎭 Exemplos Práticos - Sistema de Personalidades

## 📝 Cenários de Uso Reais

### Cenário 1: Configurar Perfil Provocador (Near)

**Objetivo:** Criar uma relação provocadora e sarcástica

```bash
# 1. Definir parâmetros principais
/definir @Near sarcasmo 0.90
/definir @Near zoeira_geral 0.95
/definir @Near humor_negro 0.85
/definir @Near sensibilidade 0.20
/definir @Near afinidade 0.65
/definir @Near espontaneidade 0.85
/definir @Near criatividade 0.80
/definir @Near paciencia 0.30
```

**Resultado esperado:**
- Tipo de relação: **Rival Amigável** ou **Amigável Provocador**
- Tom: **Provocador** / **Amigável**
- Nível de provocação: **Alto**

**Exemplo de interação:**
```
Near: @Daci e aí?
Daci: Ahh mano, beleza? 😏

Near: @Daci você é legal
Daci: Ahh... tá me bajulando agora? 🤭

Near: @Daci me ajuda com algo?
Daci: Sério que você tá perguntando isso? genial 😈
```

---

### Cenário 2: Configurar Perfil Protetor (Pure)

**Objetivo:** Criar uma relação afetiva e protetora

```bash
# 1. Definir parâmetros principais
/definir @Pure sensibilidade 0.90
/definir @Pure afinidade 0.90
/definir @Pure empatia 0.95
/definir @Pure lealdade 0.90
/definir @Pure paciencia 0.85
/definir @Pure humor_negro 0.15
/definir @Pure sarcasmo 0.20
```

**Resultado esperado:**
- Tipo de relação: **Protetor**
- Tom: **Carinhoso**
- Nível de provocação: **Baixo**

**Exemplo de interação:**
```
Pure: @Daci olá!
Daci: Oi lindinho(a)! Como vai? 💕

Pure: @Daci obrigado por tudo
Daci: Obrigado, amor! Você também é demais! 🥰

Pure: @Daci estou triste
Daci: Ei querido(a), o que aconteceu? Estou aqui pra você ❤️
```

---

### Cenário 3: Perfil Neutro (Formal)

**Objetivo:** Manter interação formal e equilibrada

```bash
# 1. Usar comando de reset
/resetar @Usuario

# Ou definir manualmente:
/definir @Usuario extroversao 0.50
/definir @Usuario sarcasmo 0.50
/definir @Usuario afinidade 0.50
# ... todos em 0.50
```

**Resultado esperado:**
- Tipo de relação: **Neutro**
- Tom: **Neutro**
- Nível de provocação: **Moderado**

**Exemplo de interação:**
```
Usuario: @Daci oi
Daci: Olha, tudo certo? 👍

Usuario: @Daci como funciona isso?
Daci: Boa pergunta! 🤔

Usuario: @Daci obrigado
Daci: Valeu, Usuario! ✌️
```

---

### Cenário 4: Perfil Misto - Amigo Brincalhão

**Objetivo:** Amigável mas com zoação moderada

```bash
/definir @Amigo afinidade 0.75
/definir @Amigo zoeira_geral 0.70
/definir @Amigo sarcasmo 0.60
/definir @Amigo empatia 0.70
/definir @Amigo sensibilidade 0.60
/definir @Amigo espontaneidade 0.75
```

**Resultado esperado:**
- Tipo de relação: **Amigável Provocador**
- Tom: **Amigável**
- Nível de provocação: **Moderado**

**Exemplo de interação:**
```
Amigo: @Daci fala!
Daci: E aí parça! Tudo certo? 😄

Amigo: @Daci me ensina algo?
Daci: Fala brother, claro! O que você quer saber? 👍

Amigo: @Daci você é chato
Daci: Ahh mano, me provocando de novo? 🙃
```

---

## 🔄 Evoluindo Relacionamentos

### De Neutro para Amigável

```bash
# Estado inicial (neutro)
/perfil @Usuario
# Afinidade: 50%, Empatia: 50%

# Aumentar afinidade gradualmente
/definir @Usuario afinidade 0.60
# Teste de interação

/definir @Usuario afinidade 0.70
# Teste de interação

/definir @Usuario afinidade 0.80
# Teste de interação
```

**Observe a mudança:**
- 0.50 → "Olha, tudo certo? 👍"
- 0.60 → "Fala Usuario! Tudo certo? 😊"
- 0.70 → "E aí parça! Como vai? 😄"
- 0.80 → "E aí amor! Como vai? 💕"

---

### Reduzindo Provocação

```bash
# Estado inicial (muito provocador)
/debug_personalidade @Usuario
# Sarcasmo: 90%, Humor Negro: 85%

# Reduzir provocação
/definir @Usuario sarcasmo 0.60
/definir @Usuario humor_negro 0.50
/definir @Usuario sensibilidade 0.70

# Verificar mudança
/debug_personalidade @Usuario
```

**Resultado:**
- Menos ironia nas respostas
- Menos emojis provocadores (😏🤭😈)
- Mais empatia e compreensão

---

## 🎯 Casos de Uso Específicos

### Caso 1: Membro Novo do Servidor

```bash
# Perfil inicial neutro (automático)
# Primeira menção cria perfil com 0.5 em tudo

# Ajustar para ser acolhedor:
/definir @NovoMembro afinidade 0.75
/definir @NovoMembro empatia 0.80
/definir @NovoMembro paciencia 0.85
/definir @NovoMembro sarcasmo 0.30
```

**Interação:**
```
NovoMembro: @Daci oi, sou novo aqui
Daci: Oi! Seja bem-vindo! Como posso ajudar? 😊
```

---

### Caso 2: Membro Problemático

```bash
# Configurar para ser mais firme:
/definir @Problematico afinidade 0.30
/definir @Problematico paciencia 0.25
/definir @Problematico sarcasmo 0.70
/definir @Problematico empatia 0.30
```

**Interação:**
```
Problematico: @Daci você é ruim
Daci: Ok. 😐

Problematico: @Daci me ajuda
Daci: Olha só... o que você precisa? 🙄
```

---

### Caso 3: Administrador do Servidor

```bash
# Perfil respeitoso e colaborativo:
/definir @Admin afinidade 0.85
/definir @Admin lealdade 0.90
/definir @Admin empatia 0.80
/definir @Admin lideranca 0.85
/definir @Admin sarcasmo 0.40
```

**Interação:**
```
Admin: @Daci preciso de ajuda com algo
Daci: Fala! Claro, estou aqui pra ajudar! Como posso auxiliar? 👍

Admin: @Daci valeu pela ajuda
Daci: Por nada! Sempre à disposição! 🙌
```

---

## 🧪 Experimentos com Influências Cruzadas

### Experimento 1: Alta Sensibilidade

```bash
# Definir sensibilidade muito alta
/definir @Teste sensibilidade 0.95

# Ver debug antes
/debug_personalidade @Teste
# Observe: humor_negro e sarcasmo automaticamente REDUZIDOS
# Empatia automaticamente AUMENTADA
```

**Influências aplicadas:**
- Humor Negro: -0.3 (de 0.75 → ~0.47)
- Sarcasmo: -0.2 (de 0.85 → ~0.66)
- Empatia: +0.2 (de 0.50 → ~0.69)

---

### Experimento 2: Alta Afinidade

```bash
# Definir afinidade muito alta
/definir @Teste afinidade 0.95

# Ver debug
/debug_personalidade @Teste
# Observe: lealdade, paciência, empatia AUMENTADOS
# Sarcasmo e humor_negro REDUZIDOS
```

**Influências aplicadas:**
- Lealdade: +0.3
- Paciência: +0.2
- Empatia: +0.25
- Sarcasmo: -0.15
- Humor Negro: -0.1

---

### Experimento 3: Zoeira Extrema

```bash
# Definir zoeira no máximo
/definir @Teste zoeira_geral 1.0

# Ver debug
/debug_personalidade @Teste
# Observe: espontaneidade e sarcasmo AUMENTADOS
# Sensibilidade REDUZIDA
```

**Influências aplicadas:**
- Espontaneidade: +0.2
- Sarcasmo: +0.15
- Sensibilidade: -0.1

---

## 📊 Comparação de Perfis

### Perfis Lado a Lado

```bash
# Ver perfil de Near
/perfil @Near

# Ver perfil de Pure
/perfil @Pure

# Comparar no debug
/debug_personalidade @Near
/debug_personalidade @Pure
```

**Comparação Near vs Pure:**

| Parâmetro | Near | Pure | Diferença |
|-----------|------|------|-----------|
| Sarcasmo | 90% | 20% | ↓ 70% |
| Afinidade | 65% | 90% | ↑ 25% |
| Sensibilidade | 20% | 90% | ↑ 70% |
| Empatia | 40% | 95% | ↑ 55% |
| Zoeira | 95% | 50% | ↓ 45% |

**Resultado:**
- Near: Provocador, irônico, zoeiro
- Pure: Carinhoso, empático, protetor

---

## 🎬 Fluxo Completo de Teste

### Passo a Passo Completo

```bash
# 1. Criar perfis de teste
node scripts/seed_personalities.js 987654321 123456789 111222333 444555666

# 2. Verificar perfis criados
/listar_perfis

# 3. Ver perfil individual de Near
/perfil @Near

# 4. Ver debug de Near
/debug_personalidade @Near

# 5. Mencionar o bot como Near
@Daci e aí?
# Observe: resposta provocadora

# 6. Mencionar o bot como Pure
@Daci olá!
# Observe: resposta carinhosa

# 7. Ajustar parâmetro de Near
/definir @Near sensibilidade 0.80

# 8. Testar novamente
@Daci e aí?
# Observe: resposta mais suave

# 9. Ver logs
cat logs/personality_interactions.log

# 10. Resetar perfil se necessário
/resetar @Near
```

---

## 💡 Dicas Práticas

### 1. Testando Rapidamente
Use o seed script para criar perfis extremos e testar diferenças rapidamente.

### 2. Encontrando o Equilíbrio
Use `/debug_personalidade` para ver exatamente como as influências cruzadas estão afetando o resultado.

### 3. Ajustes Finos
Mude um parâmetro por vez e teste para entender o impacto individual.

### 4. Monitorando Logs
Verifique `logs/personality_interactions.log` para ver o histórico de respostas.

### 5. Experimentando Extremos
Teste valores 0.0, 0.5 e 1.0 para ver os extremos de cada parâmetro.

---

## 🚀 Próximo Nível

Depois de dominar o básico, experimente:

1. **Criar perfis únicos** combinando parâmetros de forma criativa
2. **Simular evolução** ajustando parâmetros gradualmente
3. **Testar edge cases** com valores extremos
4. **Customizar templates** em `core/ResponseBuilder.js`
5. **Adicionar novos elementos linguísticos** para mais variedade

---

**Divirta-se experimentando!** 🎉

