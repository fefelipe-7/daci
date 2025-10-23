# 🧢 Guia Rápido - Linguagem Mandrake Jovem 17

## ✅ Sistema Implementado!

O Daci Bot agora fala como um **jovem de 17 anos da periferia de São Paulo**, com linguagem autêntica mandrake!

---

## 🎯 Características da Linguagem

### Como o Bot Fala Agora:

```
ANTES:  "Olá! Como você está?"
AGORA:  "eae fi! como c tá? 😎"

ANTES:  "Obrigado! Você também é incrível!"
AGORA:  "tmj mano! c é brabo tbm fi 🔥"

ANTES:  "Nossa, isso é muito interessante!"
AGORA:  "noooossa krl, mt chave isso ai! 🤯"
```

### Elementos da Linguagem:

- ✅ Tudo em **minúsculo**
- ✅ **Abreviações**: vc, pq, mt, n, tá
- ✅ **Gírias**: fi, mano, truta, parça
- ✅ **Emojis**: 😎 🔥 💀 🤡 🫠
- ✅ **Risadas**: kkk, kkkk
- ✅ **Alongamentos**: nooossa, vishhh, affff

---

## 💬 200+ Mensagens Prontas

### Saudações
```
"eae {apelido}! como c tá fi? 🔥"
"suave {apelido}? tmj parça 😎"
"fala {username} blz?"
```

### Elogios
```
"tmj {apelido}! c é brabo tbm fi 🔥"
"valeu parça! c é chave dms 😎"
"ahh para mano, c q é foda 💸"
```

### Ofensas (3 níveis)
```
LEVE:   "eita {username}, calma ai fi kkk 😭"
MÉDIA:  "vai dormir {username} 😤"
PESADA: "c é mó chato memo hein {username} 😤"
```

### Zoação
```
"ala o {username} kkkkk 😂"
"c é mó comédia fi 💀"
"vai dormir {username} kkk 🫠"
```

### Perguntas
```
"boa pergunta fi, deixa eu pensar 🤔"
"c tá brisando né {username}? 🤡"
"sei la fi, n sei disso n"
```

### Surpresa
```
"noooossa fi! brabo dms! 🔥"
"caralho mano! mt chave isso! 😱"
"mds {username}, deu ruim memo 💀"
```

---

## 🧪 Exemplos de Teste

### Teste 1: Saudação Normal
```
Você: @Daci olá
Bot: eae fi! como c tá? 😎
```

### Teste 2: Saudação com Near (baixa afinidade)
```
Near: @Daci e ai
Bot: fala near 🫠
```

### Teste 3: Elogio
```
Você: @Daci você é legal
Bot: tmj mano! c é brabo tbm fi 🔥
```

### Teste 4: Elogio Sarcástico (se sarcasmo > 0.7)
```
Rest: @Daci você é legal
Bot: ahhh claro né, me bajulando agr fi? 🤡
```

### Teste 5: Ofensa Leve
```
Você: @Daci você tá errado
Bot: eita, calma ai fi kkk 😭
```

### Teste 6: Ofensa Pesada (se paciência < 0.3)
```
Near: @Daci você é burro
Bot: vai dormir near 😤
```

### Teste 7: Pergunta
```
Você: @Daci como você funciona?
Bot: boa pergunta fi, deixa eu pensar 🤔
```

### Teste 8: Pergunta Boba (se sarcasmo > 0.7)
```
Rest: @Daci 1+1 é quanto?
Bot: serio q c ta perguntando isso fi? 💀
```

### Teste 9: Agradecimento
```
Você: @Daci obrigado
Bot: tmj mano! sempre 🤝
```

### Teste 10: Zoação
```
Você: @Daci você é doido
Bot: ala o maluco kkkkk 😂
```

---

## 🎭 Respostas Por Perfil de Usuário

### Near (Agente do Caos)
- Afinidade: 25% (BAIXA)
- Paciência: 20% (MUITO BAIXA)

```
Near: @Daci e ai
Bot: fala near 🫠

Near: @Daci fala algo
Bot: vai dormir near 😤
```

### Rest (Debochado Filosófico)
- Afinidade: 30% (BAIXA)
- Sarcasmo: 90% (MUITO ALTO)

```
Rest: @Daci e ai
Bot: eae rest... blz? 🤨

Rest: @Daci você é legal
Bot: ahh claro né, me bajulando agr fi? 🤡
```

### Madu (Neutro)
- Afinidade: 50% (MÉDIA)
- Sarcasmo: 50% (MÉDIO)

```
Madu: @Daci e ai
Bot: fala madu blz? 😎

Madu: @Daci obrigado
Bot: tmj madu! de nada fi 🤝
```

---

## 📊 Sistema de Transformação

### Exemplo de Transformação Automática:

**Original:** "Você está muito legal hoje!"

**Transformação:**
1. Minúsculo: "você está muito legal hoje!"
2. Abreviações: "vc tá mt legal hj!"
3. Remove ponto: "vc tá mt legal hj"
4. Emoji: "vc tá mt legal hj 😎"

**Final:** "vc tá mt legal hj 😎"

---

## 🔧 Arquivos Criados

```
core/
├── DaciPersonality.js      - Identidade base (vocabulário, emojis)
├── MessageTemplates.js     - 200+ mensagens prontas
├── LanguageTransformer.js  - Transformador de linguagem
└── ResponseBuilder.js      - Construtor de respostas (atualizado)

docbases/
└── docbase-2-linguagem-mandrake.md - Documentação técnica

Backup:
└── core/ResponseBuilder_BACKUP.js - Backup do sistema antigo
```

---

## 💡 Dicas de Uso

### 1. Mencione o bot normalmente
```
@Daci olá
@Daci como vai?
@Daci obrigado
```

### 2. O bot responde diferente por pessoa
- Near/Rest: Tom mais frio e irritado
- Outros: Tom amigável e zoeiro

### 3. O bot detecta contexto automaticamente
- Detecta saudações, elogios, ofensas, perguntas
- Escolhe resposta adequada

### 4. Nunca repete a mesma resposta
- 200+ variações de mensagens
- Seleção aleatória dentro da categoria

---

## 🎯 Categorias Detectadas

```
oi/olá/e ai/fala      → SAUDAÇÃO
obrigado/valeu/tmj    → ELOGIO
burro/idiota/merda    → OFENSA
tá errado/vacilou     → PROVOCAÇÃO
como/quando/por que   → PERGUNTA
resto                 → CASUAL
```

---

## 📝 Logs de Debug

Os logs ainda mostram o **apelido detectado**:

```
[NICKNAME DEBUG] User ID: 1340544045268733964 | Username: near | Apelido Detectado: Near
[PERSONALITY] Respondeu para Near | Tipo: rival | Tom: hostil
```

---

## 🚀 Próximos Passos

### Aplicar Perfis de Usuários

Para que o bot responda diferente por pessoa, você precisa aplicar os perfis:

```bash
# Aplicar todos os perfis configurados
node scripts/apply_all_profiles.js <GUILD_ID>

# Ou individual
node scripts/apply_rest_profile.js <GUILD_ID>
node scripts/apply_near_profile.js <GUILD_ID>
```

### Ver Perfil de Usuário

```
/perfil @Near
/perfil @Rest
```

### Debug de Personalidade

```
/debug_personalidade @Near
```

Isso mostra como a personalidade composta foi calculada!

---

## ✅ Checklist

- [x] Identidade base criada (DaciPersonality.js)
- [x] 200+ mensagens prontas (MessageTemplates.js)
- [x] Transformador de linguagem (LanguageTransformer.js)
- [x] ResponseBuilder atualizado
- [x] Sistema integrado com personalidades
- [x] Bot reiniciado
- [ ] Aplicar perfis de usuários (use scripts)
- [ ] Testar interações reais
- [ ] Ajustar conforme feedback

---

## 🎉 Resultado

**O Daci Bot agora fala 100% em linguagem mandrake autêntica!**

Cada interação é única, natural e se adapta à personalidade individual de cada usuário. O bot tem mais de 200 mensagens prontas em 13 categorias diferentes, garantindo que nunca soa repetitivo ou artificial.

**É como conversar com um amigo real de 17 anos da quebrada!** 🔥

---

**Implementado em:** 23 de Outubro de 2025  
**Versão:** 2.0.0 - Linguagem Mandrake Completa

