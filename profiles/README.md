# 📋 Perfis de Usuários Conhecidos

## 🎯 Sistema de Apelidos

O Daci Bot reconhece usuários específicos e os chama por apelidos predefinidos. Usuários não reconhecidos são chamados de **"random"**.

## 👥 Usuários Conhecidos

| Apelido | User ID              | Arquivo          | Status     |
|---------|----------------------|------------------|------------|
| Rest    | 1428244923970490483  | `rest.json`      | ✅ Criado  |
| Near    | 1340544045268733964  | `near.json`      | ✅ Criado  |
| Pure    | 669563573256716309   | `pure.json`      | ✅ Criado  |
| Madu    | 756986971527577670   | `madu.json`      | ✅ Criado  |
| Vic     | 1183874010686164994  | `vic.json`       | ✅ Criado  |
| Tim     | 455428688314630164   | `tim.json`       | ✅ Criado  |
| PH      | 700394542783791244   | `ph.json`        | ✅ Criado  |
| Peu     | 1429168129409286145  | `peu.json`       | ✅ Criado  |

## 📝 Como Funciona

### Reconhecimento Automático

Quando um usuário menciona o bot:
- Se o User ID estiver na lista → Bot chama pelo **apelido**
- Se não estiver na lista → Bot chama de **"random"**

**Exemplo:**
```
Near: @Daci olá!
Daci: E aí Near! Como vai? 😄

Usuario_Desconhecido: @Daci olá!
Daci: E aí random! Como vai? 😄
```

### Independente do Username

O sistema usa **User ID**, não username. Mesmo que "Near" mude seu username no Discord para "OutroNome", o bot continuará chamando de "Near".

## 🎨 Personalizando Perfis

### Estrutura do Arquivo JSON

Cada arquivo de perfil possui:

```json
{
  "user_id": "1340544045268733964",
  "username": "near",
  "apelido": "Near",
  "descricao": "Perfil de personalidade para Near - A ser customizado",
  
  "parametros": {
    "extroversao": 0.5,
    "sarcasmo": 0.5,
    // ... todos os 15 parâmetros
  },
  
  "notas": "Perfil vazio - Personalize os parâmetros conforme necessário"
}
```

### Como Personalizar

**Opção 1: Editar manualmente o arquivo JSON**

```bash
# Editar arquivo
nano profiles/near.json

# Alterar parâmetros (0.0 a 1.0)
"sarcasmo": 0.90,
"afinidade": 0.65,
"zoeira_geral": 0.95
```

**Opção 2: Usar comandos do bot**

```
/definir @Near sarcasmo 0.90
/definir @Near afinidade 0.65
/definir @Near zoeira_geral 0.95
```

**Nota:** Os comandos do bot salvam no banco SQLite, não nos arquivos JSON. Os arquivos JSON são apenas para **referência e planejamento**.

## 🔄 Workflow Recomendado

### 1. Planejar no JSON
Edite o arquivo JSON para planejar a personalidade:

```json
{
  "user_id": "1340544045268733964",
  "apelido": "Near",
  
  "parametros": {
    "sarcasmo": 0.90,
    "zoeira_geral": 0.95,
    "sensibilidade": 0.20,
    "humor_negro": 0.85
  },
  
  "notas": "Near - Provocador e sarcástico, gosta de zoeira pesada"
}
```

### 2. Aplicar com Comandos
Use os comandos para aplicar os valores planejados:

```bash
/definir @Near sarcasmo 0.90
/definir @Near zoeira_geral 0.95
/definir @Near sensibilidade 0.20
/definir @Near humor_negro 0.85
```

### 3. Testar Interação
Mencione o bot e observe a resposta:

```
@Daci e aí?
```

### 4. Ajustar Conforme Necessário
Use `/debug_personalidade @Near` para ver cálculos e ajuste.

## 🚀 Script de Seed

Para aplicar múltiplos perfis de uma vez, você pode criar um script:

```javascript
// scripts/apply_profiles.js
const fs = require('fs');
const path = require('path');

const profilesDir = path.join(__dirname, '..', 'profiles');
const files = fs.readdirSync(profilesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const profile = JSON.parse(fs.readFileSync(path.join(profilesDir, file), 'utf8'));
    
    console.log(`\n📝 Perfil: ${profile.apelido} (${profile.user_id})`);
    console.log('Comandos para aplicar:');
    
    for (const [param, value] of Object.entries(profile.parametros)) {
        if (value !== 0.5) { // Só mostrar parâmetros diferentes do padrão
            console.log(`/definir @${profile.apelido} ${param} ${value}`);
        }
    }
}
```

Execute:
```bash
node scripts/apply_profiles.js
```

## 📊 Exemplos de Perfis

### Perfil Provocador (Rest/Near)

```json
{
  "parametros": {
    "sarcasmo": 0.90,
    "zoeira_geral": 0.95,
    "sensibilidade": 0.20,
    "humor_negro": 0.85,
    "espontaneidade": 0.85,
    "afinidade": 0.65
  }
}
```

**Resultado:** Tom provocador, muito sarcasmo, zoeira pesada

### Perfil Afetivo (Pure)

```json
{
  "parametros": {
    "sensibilidade": 0.90,
    "afinidade": 0.90,
    "empatia": 0.95,
    "lealdade": 0.90,
    "sarcasmo": 0.20,
    "humor_negro": 0.15
  }
}
```

**Resultado:** Tom carinhoso, protetor, sem sarcasmo ou humor pesado

### Perfil Neutro

```json
{
  "parametros": {
    // Todos em 0.5 (padrão)
  }
}
```

**Resultado:** Tom neutro, equilibrado

## 🔧 Manutenção

### Adicionar Novo Usuário

1. Criar arquivo JSON:
```bash
cp profiles/near.json profiles/novo_usuario.json
```

2. Editar o arquivo:
```json
{
  "user_id": "123456789012345678",
  "username": "novo_usuario",
  "apelido": "NovoApelido"
}
```

3. Atualizar `core/UserNicknames.js`:
```javascript
const KNOWN_USERS = {
    // ... existentes ...
    '123456789012345678': 'NovoApelido'
};
```

### Remover Usuário

1. Deletar arquivo JSON:
```bash
rm profiles/usuario.json
```

2. Remover de `core/UserNicknames.js`

3. Resetar perfil no banco:
```
/resetar @Usuario
```

## 📝 Notas Importantes

- **Arquivos JSON** = Planejamento e referência
- **Banco SQLite** = Estado atual dos perfis
- **core/UserNicknames.js** = Sistema de apelidos (hardcoded)
- Os arquivos JSON **não são carregados automaticamente** pelo bot
- Use os comandos `/definir` para aplicar valores no banco

## 🎯 Próximos Passos

Depois de criar os perfis:

1. Personalize os valores nos arquivos JSON
2. Aplique usando comandos `/definir`
3. Teste com menções ao bot
4. Ajuste conforme feedback
5. Use `/debug_personalidade` para análise

---

**Criado em:** 23 de Outubro de 2025  
**Total de Perfis:** 8 usuários conhecidos + "random" para desconhecidos

