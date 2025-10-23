# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o DACI Discord Bot! Este documento contém diretrizes para contribuir com o projeto.

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e acolhedor para todos.

## 🚀 Como Contribuir

### Reportando Bugs

Antes de criar uma issue sobre um bug:
1. Verifique se o bug já não foi reportado
2. Use a versão mais recente do projeto
3. Inclua informações detalhadas:
   - Versão do Node.js
   - Sistema operacional
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Logs de erro (se houver)

### Sugerindo Melhorias

Para sugerir novas funcionalidades:
1. Verifique se a funcionalidade já não foi sugerida
2. Explique claramente o problema que ela resolve
3. Descreva a solução proposta
4. Considere alternativas

### Pull Requests

#### Processo

1. **Fork o repositório**
```bash
git clone https://github.com/seu-usuario/daci-discord-bot.git
cd daci-discord-bot
```

2. **Crie uma branch para sua feature**
```bash
git checkout -b feature/minha-nova-feature
```

3. **Faça suas alterações**
   - Siga o estilo de código existente
   - Adicione comentários quando necessário
   - Teste suas mudanças

4. **Commit suas mudanças**
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

Use commits semânticos:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, ponto e vírgula, etc.
- `refactor:` - Refatoração de código
- `test:` - Adicionar testes
- `chore:` - Manutenção

5. **Push para sua branch**
```bash
git push origin feature/minha-nova-feature
```

6. **Abra um Pull Request**
   - Descreva claramente suas mudanças
   - Referencie issues relacionadas
   - Aguarde review

#### Checklist do Pull Request

- [ ] O código segue o estilo do projeto
- [ ] Comentários foram adicionados em código complexo
- [ ] A documentação foi atualizada (se necessário)
- [ ] As mudanças foram testadas
- [ ] Nenhum erro foi introduzido
- [ ] O commit message segue as convenções

## 💻 Configuração do Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 16.9.0+
- npm ou yarn
- Git

### Setup

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/daci-discord-bot.git
cd daci-discord-bot
```

2. **Instale dependências**
```bash
npm install
```

3. **Configure variáveis de ambiente**
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

4. **Execute em modo desenvolvimento**
```bash
npm run dev
```

## 📝 Estilo de Código

### JavaScript
- Use `const` e `let`, evite `var`
- Use template literals quando possível
- Indentação: 4 espaços
- Ponto e vírgula obrigatório
- Nomes descritivos para variáveis e funções

### Exemplo
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exemplo')
        .setDescription('Comando de exemplo'),
    
    async execute(interaction) {
        const user = interaction.user;
        const mensagem = `Olá, ${user.username}!`;
        
        await interaction.reply({
            content: mensagem,
            ephemeral: true
        });
    }
};
```

## 🏗️ Estrutura de Comandos

Ao criar novos comandos, siga a estrutura:

```
commands/
└── categoria/
    └── comando.js
```

Template de comando:
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comando')
        .setDescription('Descrição do comando')
        .addStringOption(option =>
            option.setName('parametro')
                .setDescription('Descrição do parâmetro')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        // Lógica do comando
        await interaction.reply('Resposta');
    }
};
```

## 🧪 Testes

Antes de submeter um PR:
1. Teste o comando manualmente
2. Verifique se não há erros no console
3. Teste em diferentes cenários (sucesso, falha, edge cases)

## 📚 Documentação

Ao adicionar novas funcionalidades:
1. Atualize o README.md se necessário
2. Adicione comentários no código
3. Crie documentação na pasta `docs/` se for uma feature grande

## 🔍 Review de Código

Todos os PRs passam por review. O processo inclui:
- Verificação de estilo de código
- Testes de funcionalidade
- Análise de performance
- Verificação de segurança

## 📞 Dúvidas?

Se tiver dúvidas sobre como contribuir:
1. Abra uma issue com a tag `question`
2. Descreva sua dúvida claramente
3. Aguarde resposta da comunidade

## 🎯 Áreas que Precisam de Ajuda

Estamos sempre procurando ajuda em:
- [ ] Adicionar mais testes
- [ ] Melhorar documentação
- [ ] Otimização de performance
- [ ] Novas funcionalidades de música
- [ ] Mais perfis de personalidade
- [ ] Tradução para outros idiomas

## 🌟 Reconhecimento

Contribuidores serão:
- Listados no README.md
- Mencionados nas release notes
- Reconhecidos na comunidade

Obrigado por contribuir! 🚀

---

**Questões?** Abra uma [issue](https://github.com/seu-usuario/daci-discord-bot/issues) ou entre em contato.

