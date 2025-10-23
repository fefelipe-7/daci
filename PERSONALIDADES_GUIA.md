# 🎭 Guia Rápido - Sistema de Personalidades do Daci

## 🚀 Início Rápido

### 1. Registrar Comandos

```bash
# Por servidor (recomendado - instantâneo)
node deploy-guild-commands.js SEU_GUILD_ID

# Global (leva até 1h)
node deploy-commands.js
```

### 2. Criar Perfis de Teste

```bash
node scripts/seed_personalities.js GUILD_ID NEAR_ID REST_ID PURE_ID
```

**Exemplo:**
```bash
node scripts/seed_personalities.js 987654321 123456789 111222333 444555666
```

### 3. Testar Interação

Mencione o bot em qualquer canal:
```
@Daci olá!
@Daci como você está?
@Daci você é incrível!
```

O bot responderá de forma personalizada baseado no perfil do usuário!

## 📋 Comandos Disponíveis

### Comandos Públicos

#### `/perfil [usuario]`
Visualiza o perfil de personalidade de qualquer usuário.

**Exemplos:**
- `/perfil` - Ver seu próprio perfil
- `/perfil @Near` - Ver perfil do Near

**Retorna:**
- 15 parâmetros com barras visuais
- Tipo de relação com o bot
- Total de interações via menção
- Data de criação do perfil

---

### Comandos Admin (apenas OWNER_ID)

#### `/definir <usuario> <parametro> <valor>`
Configura um parâmetro específico de um usuário.

**Parâmetros:**
- `usuario`: Usuário a configurar
- `parametro`: Um dos 15 parâmetros (menu dropdown)
- `valor`: 0.0 a 1.0

**Exemplos:**
```
/definir @Near sarcasmo 0.90
/definir @Pure sensibilidade 0.90
/definir @Rest afinidade 0.65
```

#### `/resetar <usuario>`
Reseta todos os parâmetros de um usuário para 0.5 (neutro).

**Exemplo:**
```
/resetar @Near
```

⚠️ Pede confirmação via botão antes de resetar!

#### `/listar_perfis`
Lista todos os perfis customizados do servidor.

Mostra apenas usuários com parâmetros diferentes de 0.5 (neutros).

**Retorna:**
- Username e User ID
- Parâmetros modificados (com emojis)
- Total de interações

#### `/debug_personalidade <usuario>`
Mostra os cálculos internos da personalidade composta.

**Exemplo:**
```
/debug_personalidade @Near
```

**Retorna:**
- Base do bot
- Perfil do usuário
- Fusão ponderada
- Influências cruzadas aplicadas
- Tipo de relação calculado
- Estilo de resposta final

---

## 🎯 Perfis Pré-Configurados

### Near - Provocador Sarcástico
```
Sarcasmo: 90%
Zoeira: 95%
Sensibilidade: 20%
Humor Negro: 85%
```

**Relação esperada:** Rival Amigável / Amigável Provocador

**Exemplo de resposta:**
```
User: @Daci e aí?
Bot: Ahh mano, beleza? 😏
```

---

### Rest - Provocador Similar
```
Sarcasmo: 90%
Zoeira: 90%
Sensibilidade: 25%
Humor Negro: 85%
```

**Relação esperada:** Amigável Provocador

---

### Pure - Sensível e Afetivo
```
Sensibilidade: 90%
Afinidade: 90%
Empatia: 95%
Humor Negro: 15%
```

**Relação esperada:** Protetor

**Exemplo de resposta:**
```
User: @Daci olá
Bot: Oi lindinho(a)! Como vai? 💕
```

---

### Neutro - Baseline
```
Todos os parâmetros: 50%
```

**Relação esperada:** Neutro

---

## 🧪 Testando o Sistema

### 1. Criar Perfis de Teste
```bash
# Substitua pelos IDs reais
node scripts/seed_personalities.js \
  987654321 \  # Guild ID
  123456789 \  # Near ID
  111222333 \  # Rest ID
  444555666    # Pure ID
```

### 2. Verificar Perfis Criados
```
/listar_perfis
```

### 3. Ver Perfil Específico
```
/perfil @Near
```

### 4. Testar Interações

**Com Near (sarcástico):**
```
@Daci e aí?
→ Resposta esperada: Tom provocador, sarcástico
```

**Com Pure (sensível):**
```
@Daci olá
→ Resposta esperada: Tom carinhoso, protetor
```

### 5. Debug para Entender Cálculos
```
/debug_personalidade @Near
```

Isso mostra exatamente como a personalidade composta foi calculada!

---

## 🎨 Customizando Perfis

### Exemplo: Tornar alguém extremamente sarcástico
```
/definir @Usuario sarcasmo 0.95
/definir @Usuario humor_negro 0.85
/definir @Usuario zoeira_geral 0.90
/definir @Usuario sensibilidade 0.20
```

### Exemplo: Criar relação afetiva
```
/definir @Usuario afinidade 0.95
/definir @Usuario empatia 0.90
/definir @Usuario sensibilidade 0.85
/definir @Usuario sarcasmo 0.20
```

### Exemplo: Perfil neutro/formal
```
/resetar @Usuario
```

---

## 📊 Entendendo os Parâmetros

### Principais para Personalidade

| Parâmetro | Alto (0.8-1.0) | Baixo (0.0-0.2) |
|-----------|----------------|-----------------|
| **Sarcasmo** | Muito irônico, provocador | Direto, sem ironia |
| **Afinidade** | Carinhoso, usa apelidos | Distante, formal |
| **Sensibilidade** | Suave, evita humor pesado | Direto, sem filtro |
| **Zoeira** | Brincalhão, descontraído | Sério, formal |
| **Empatia** | Compreensivo, paciente | Objetivo, direto |

### Influências Cruzadas Importantes

- **Alta Afinidade** → Aumenta Lealdade, Paciência | Reduz Sarcasmo
- **Alta Sensibilidade** → Aumenta Empatia | Reduz Humor Negro e Sarcasmo
- **Alta Zoeira** → Aumenta Espontaneidade e Sarcasmo

---

## 📝 Logs de Interação

Todas as interações são registradas em:
```
logs/personality_interactions.log
```

**Formato:**
```
[2024-10-23T10:30:00.000Z] USER: Near (123456789)
MENSAGEM: e aí bot
RESPOSTA: Ahh mano, beleza? 😏
PARAMETROS: sarcasmo=0.87, afinidade=0.51, empatia=0.42
ESTILO: provocador (provocacao: alto)
================================================================================
```

---

## 🔧 Troubleshooting

### Bot não responde às menções
1. Verifique se o evento `messageCreate` foi carregado:
   ```
   ✅ Evento messageCreate carregado!
   ```
2. Certifique-se que o bot tem intent `MessageContent` habilitado no Discord Developer Portal
3. Veja os logs em `logs/personality_interactions.log`

### Comandos não aparecem
1. Use deploy por servidor para ser instantâneo:
   ```bash
   node deploy-guild-commands.js SEU_GUILD_ID
   ```
2. Se usou deploy global, aguarde até 1 hora

### Erro ao criar banco de dados
- O diretório `database/` é criado automaticamente
- Permissões de escrita são necessárias no diretório do projeto

### Perfis não salvam
- Verifique os logs do console
- Teste manualmente:
  ```bash
  node scripts/seed_personalities.js GUILD_ID USER_ID
  ```

---

## 🚀 Próximos Passos

Depois de testar o sistema:

1. **Ajustar Personalidade Base do Bot** em `models/UserPersonality.js` (linha 7-21)
2. **Customizar Elementos Linguísticos** em `core/ResponseBuilder.js` (linha 2-42)
3. **Adicionar Mais Templates** em `core/ResponseBuilder.js` (linha 45-75)
4. **Integrar IA** substituindo `ResponseBuilder.gerarRespostaTemplate()`

---

## 📚 Documentação Completa

Veja `docbases/docbase-1.md` para documentação técnica completa do sistema.

---

**Criado em:** 23 de Outubro de 2025  
**Versão:** 1.0.0

