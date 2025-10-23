# 🏷️ Sistema de Apelidos - Guia Completo

## 📋 Visão Geral

O Daci Bot agora reconhece usuários específicos e os chama por apelidos únicos. Qualquer usuário que não esteja na lista será chamado de **"random"**.

## 👥 Usuários Reconhecidos

| Apelido | Discord ID           | Como o Bot Chama |
|---------|----------------------|------------------|
| Rest    | 1428244923970490483  | "Rest"           |
| Near    | 1340544045268733964  | "Near"           |
| Pure    | 669563573256716309   | "Pure"           |
| Madu    | 756986971527577670   | "Madu"           |
| Vic     | 1183874010686164994  | "Vic"            |
| Tim     | 455428688314630164   | "Tim"            |
| PH      | 700394542783791244   | "PH"             |
| Peu     | 1429168129409286145  | "Peu"            |
| **?**   | **Qualquer outro**   | **"random"**     |

## 🎯 Exemplos de Interação

### Usuário Conhecido (Near)

```
Near: @Daci e aí?
Daci: E aí Near! Tudo certo? 😄

Near: @Daci como vai?
Daci: Fala Near! Beleza? 👍
```

### Usuário Desconhecido

```
JoaoRandom123: @Daci e aí?
Daci: E aí random! Tudo certo? 😄

MariaDesconhecida: @Daci como vai?
Daci: Fala random! Beleza? 👍
```

## 🔧 Como Funciona Internamente

### Sistema de Reconhecimento

1. **Usuário menciona o bot**
2. **Bot captura o User ID** (não o username)
3. **Verifica no mapeamento** (`core/UserNicknames.js`)
4. **Retorna apelido ou "random"**
5. **Usa apelido na resposta**

### Independência do Username

O sistema usa **Discord User ID**, que nunca muda. Mesmo se o usuário mudar o username/nickname no servidor, o bot continuará reconhecendo pelo ID.

**Exemplo:**
```
User ID: 1340544045268733964
Username atual: "near_2024"
Username anterior: "near_old"
Username no servidor: "NearTheGreat"

Bot sempre chama: "Near" (baseado no ID, não no username)
```

## 📁 Arquivos do Sistema

### 1. `core/UserNicknames.js`
Módulo que gerencia o mapeamento User ID → Apelido

```javascript
const KNOWN_USERS = {
    '1340544045268733964': 'Near',
    '1428244923970490483': 'Rest',
    // ... etc
};
```

**Métodos disponíveis:**
- `getNickname(userId)` → Retorna apelido ou "random"
- `isKnownUser(userId)` → Verifica se usuário é conhecido
- `getUserInfo(userId)` → Retorna informações completas

### 2. `profiles/*.json`
Arquivos de perfil para planejamento/referência

```json
{
  "user_id": "1340544045268733964",
  "apelido": "Near",
  "parametros": { ... }
}
```

**Nota:** Estes arquivos **não são carregados automaticamente**. São apenas para documentação.

### 3. `core/ResponseBuilder.js`
Atualizado para usar o sistema de apelidos ao construir respostas.

### 4. `events/messageCreate.js`
Passa o `userId` para o `ResponseBuilder` para reconhecimento.

## 🎨 Personalizando Respostas por Usuário

### Combinação: Apelido + Personalidade

O sistema combina **apelidos fixos** com **parâmetros de personalidade dinâmicos**:

```bash
# Near - Provocador
/definir @Near sarcasmo 0.90
/definir @Near zoeira_geral 0.95

# Pure - Afetivo
/definir @Pure afinidade 0.90
/definir @Pure sensibilidade 0.90
```

**Resultado:**

```
Near: @Daci e aí?
Daci: Ahh Near... beleza? 😏  # Sarcástico + apelido "Near"

Pure: @Daci e aí?
Daci: Oi Pure! Como vai? 💕  # Carinhoso + apelido "Pure"
```

## 🔄 Variações de Template

Dependendo do **tom** e **afinidade**, o bot pode usar variações:

### Alta Afinidade (> 0.7)
```
Template: "E aí {apelido}! Como vai? {emoji}"

Near: @Daci olá
Daci: E aí Near! Como vai? 😄
```

### Afinidade Média (0.5-0.7)
```
Template: "Fala {username}! Tudo certo? {emoji}"

Rest: @Daci olá
Daci: Fala Rest! Tudo certo? 👍
```

### Baixa Afinidade (< 0.3)
```
Template: "Oi {username}. {emoji}"

Tim: @Daci olá
Daci: Oi Tim. 😐
```

### Tom Provocador
```
Template: "{prefixo}, {username}... {emoji}"

Near: @Daci olá
Daci: Ahh, Near... 😏
```

## 🚀 Testando o Sistema

### Teste 1: Verificar Reconhecimento

```javascript
// No console do bot ou em script
const UserNicknames = require('./core/UserNicknames');

console.log(UserNicknames.getNickname('1340544045268733964')); // "Near"
console.log(UserNicknames.getNickname('999999999999999999')); // "random"
```

### Teste 2: Interação Real

```
# Como Near
@Daci olá

# Observe: Bot deve chamar "Near", não seu username do Discord
```

### Teste 3: Usuário Desconhecido

```
# Com uma conta que não está na lista
@Daci olá

# Observe: Bot deve chamar "random"
```

## 🔧 Adicionando Novo Usuário

### Passo 1: Obter User ID

No Discord:
```
1. Ativar Developer Mode (Configurações > Avançado > Modo Desenvolvedor)
2. Clicar com botão direito no usuário
3. Copiar ID
```

### Passo 2: Criar Perfil JSON

```bash
# Copiar template
cp profiles/near.json profiles/novo_usuario.json

# Editar
nano profiles/novo_usuario.json
```

```json
{
  "user_id": "123456789012345678",
  "username": "novo_usuario",
  "apelido": "NovoApelido",
  "parametros": { ... }
}
```

### Passo 3: Adicionar ao Sistema de Apelidos

Editar `core/UserNicknames.js`:

```javascript
const KNOWN_USERS = {
    // Existentes
    '1428244923970490483': 'Rest',
    '1340544045268733964': 'Near',
    // ... outros ...
    
    // Novo
    '123456789012345678': 'NovoApelido'
};
```

### Passo 4: Reiniciar Bot

```bash
# Parar bot
Ctrl+C

# Iniciar novamente
npm start
```

### Passo 5: Testar

```
NovoUsuario: @Daci olá
# Bot deve responder: "E aí NovoApelido! ..."
```

## ❌ Removendo Usuário

### 1. Remover de `core/UserNicknames.js`

```javascript
const KNOWN_USERS = {
    '1340544045268733964': 'Near',
    // REMOVER: '123456789012345678': 'VelhoApelido'
    '1428244923970490483': 'Rest'
};
```

### 2. Deletar Arquivo JSON (opcional)

```bash
rm profiles/usuario.json
```

### 3. Resetar Perfil no Banco (opcional)

```
/resetar @Usuario
```

### 4. Reiniciar Bot

```bash
npm start
```

**Resultado:** Usuário agora será chamado de "random"

## 🎭 Integração com Sistema de Personalidades

O sistema de apelidos funciona **em conjunto** com o sistema de personalidades:

### Apelido (Fixo)
```javascript
User ID → "Near", "Rest", "Pure", etc.
```

### Personalidade (Dinâmica)
```javascript
Parâmetros → Tom, Provocação, Estilo de resposta
```

### Resultado Final
```
Near com sarcasmo alto:
"Ahh Near, beleza? 😏"

Near com afinidade alta:
"E aí Near! Como vai? 😄"

Pure com afinidade alta:
"Oi Pure! Tudo bem? 💕"

Random com neutro:
"Olha random, tudo certo? 👍"
```

## 📊 Estatísticas

- **Usuários conhecidos:** 8
- **Apelido padrão:** "random"
- **Arquivos de perfil:** 8 JSON
- **Sistema ativo:** ✅

## 🎯 Casos de Uso

### Caso 1: Servidor Privado com Amigos

```
Todos têm apelidos únicos:
- Near, Rest, Pure, Madu, Vic, Tim, PH, Peu

Bot reconhece todos e cria interações personalizadas.
```

### Caso 2: Servidor Público

```
Membros principais têm apelidos.
Visitantes/novos = "random"

Bot diferencia entre "galera" e "randoms".
```

### Caso 3: Evolução de Relacionamento

```
Novo membro entra:
- Inicialmente: "random"
- Depois de integração: Adiciona apelido personalizado
```

## 🔍 Debug

### Verificar Apelido no Console

```javascript
const UserNicknames = require('./core/UserNicknames');

// Verificar todos
console.log(UserNicknames.getKnownUsers());

// Verificar específico
console.log(UserNicknames.getUserInfo('1340544045268733964'));
```

### Logs de Interação

Verifique `logs/personality_interactions.log`:

```
[2024-10-23T10:30:00.000Z] USER: Near (1340544045268733964)
MENSAGEM: e aí?
RESPOSTA: Ahh Near, beleza? 😏
```

O apelido "Near" aparece na resposta!

## ✅ Checklist de Implementação

- [x] Criar `core/UserNicknames.js`
- [x] Atualizar `core/ResponseBuilder.js`
- [x] Atualizar `events/messageCreate.js`
- [x] Criar arquivos JSON para 8 usuários
- [x] Documentar sistema
- [x] Testar reconhecimento
- [ ] Personalizar parâmetros de cada usuário
- [ ] Testar interações reais

---

**Sistema Completo e Funcional!** 🎉

**Criado em:** 23 de Outubro de 2025  
**Total de Apelidos:** 8 conhecidos + "random" padrão

