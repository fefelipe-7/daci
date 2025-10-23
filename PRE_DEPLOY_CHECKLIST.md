# ✅ Checklist Pré-Deploy

Use este checklist antes de fazer deploy no GitHub para garantir que tudo está configurado corretamente.

## 📋 Configuração Básica

- [ ] **Arquivo `.env` configurado** (NÃO fazer commit dele!)
  - [ ] `DISCORD_TOKEN` configurado
  - [ ] `CLIENT_ID` configurado
  - [ ] `OWNER_ID` configurado
  - [ ] `LOG_CHANNEL_ID` configurado (opcional)

- [ ] **Arquivo `config.json` revisado**
  - [ ] Tokens removidos (usar apenas `.env`)
  - [ ] IDs pessoais removidos (usar apenas `.env`)
  - [ ] Configurações de módulos corretas

- [ ] **Dependências instaladas**
  ```bash
  npm install
  ```

- [ ] **Bot testado localmente**
  ```bash
  npm start
  ```

## 🔒 Segurança

- [ ] **Nenhum token ou senha no código**
- [ ] **Arquivo `.env` NÃO commitado** (verificar .gitignore)
- [ ] **Banco de dados `.db` NÃO commitado**
- [ ] **`node_modules/` NÃO commitado**

### Verificar Arquivos Sensíveis
```bash
# Execute para verificar o que será commitado
git status
git diff --cached

# Verifique se nenhum arquivo sensível está listado
```

## 📝 Documentação

- [ ] **README.md atualizado**
  - [ ] URL do repositório correta
  - [ ] Seu nome/usuário do GitHub
  - [ ] Badges atualizados (após criar repo)

- [ ] **package.json atualizado**
  - [ ] Nome do projeto correto
  - [ ] URL do repositório GitHub
  - [ ] Autor correto
  - [ ] Versão correta

- [ ] **CHANGELOG.md revisado**
  - [ ] Versão atual documentada
  - [ ] Mudanças principais listadas

## 🧪 Testes

- [ ] **Comandos básicos testados**
  - [ ] `/help` funciona
  - [ ] `/userinfo` funciona
  - [ ] `/serverinfo` funciona

- [ ] **Sistema de música testado**
  - [ ] `/play` com YouTube
  - [ ] `/play` com Spotify (se configurado)
  - [ ] Controles (pause, resume, skip)

- [ ] **Comandos de moderação testados** (se habilitado)
  - [ ] `/kick` funciona
  - [ ] `/clear` funciona

- [ ] **Sistema de personalidades testado**
  - [ ] `/perfil` funciona
  - [ ] `/listar_perfis` funciona

## 🚀 Git e GitHub

- [ ] **Git inicializado**
  ```bash
  git init
  ```

- [ ] **Arquivos adicionados**
  ```bash
  git add .
  ```

- [ ] **Commit inicial criado**
  ```bash
  git commit -m "🎉 feat: versão 2.0.0 - projeto completamente reorganizado"
  ```

- [ ] **Repositório GitHub criado**
  - [ ] Nome: `daci-discord-bot` (ou outro)
  - [ ] Descrição adicionada
  - [ ] Público ou Privado definido

- [ ] **Remote adicionado**
  ```bash
  git remote add origin https://github.com/SEU-USUARIO/daci-discord-bot.git
  ```

- [ ] **Push realizado**
  ```bash
  git branch -M main
  git push -u origin main
  ```

## 📋 Configurações do GitHub (Após Push)

- [ ] **About configurado**
  - [ ] Descrição clara
  - [ ] Website (se houver)
  - [ ] Tópicos adicionados

- [ ] **Tópicos sugeridos**
  - [ ] `discord`
  - [ ] `discord-bot`
  - [ ] `discord-js`
  - [ ] `music-bot`
  - [ ] `moderation`
  - [ ] `nodejs`
  - [ ] `javascript`

- [ ] **README.md visualizado**
  - [ ] Formatação correta
  - [ ] Links funcionando
  - [ ] Estrutura legível

- [ ] **LICENSE visível**
  - [ ] GitHub reconheceu a licença MIT

## 🎯 Opcional mas Recomendado

- [ ] **Criar primeira Release**
  - [ ] Tag `v2.0.0`
  - [ ] Notas da release
  - [ ] Marcar como latest

- [ ] **Configurar GitHub Pages** (para documentação)

- [ ] **Adicionar badges ao README**
  - [ ] License badge
  - [ ] Version badge
  - [ ] Node.js version badge

- [ ] **Configurar branch protection**
  - [ ] Require PR reviews
  - [ ] Require status checks

- [ ] **Habilitar Discussions** (para comunidade)

- [ ] **Criar Wiki** (documentação adicional)

## 🔧 Deploy em Produção (Render/Heroku)

- [ ] **Variáveis de ambiente configuradas no serviço**
- [ ] **Build bem-sucedido**
- [ ] **Bot online e respondendo**
- [ ] **Logs sem erros críticos**
- [ ] **Anti-hibernação configurado** (se Render)

## ✅ Checklist Final

Antes do push final, confirme:

1. ✅ Nenhuma informação sensível no código
2. ✅ Tudo testado e funcionando
3. ✅ Documentação completa e atualizada
4. ✅ .gitignore configurado corretamente
5. ✅ Commit message descritivo
6. ✅ Pronto para compartilhar!

---

## 🚀 Comando Rápido (PowerShell)

Para automatizar o setup inicial:
```powershell
.\scripts\git-setup.ps1
```

Depois, siga as instruções exibidas!

---

## 📞 Problemas?

Se encontrar algum problema:
1. Revise o checklist
2. Consulte `DEPLOY_GITHUB.md`
3. Verifique os logs de erro
4. Consulte a documentação em `docs/`

**Boa sorte com o deploy! 🎉**

