# Política de Segurança do Daci Bot

## 🔒 Visão Geral

A segurança é uma prioridade fundamental para o projeto Daci Bot. Este documento descreve as práticas de segurança, como reportar vulnerabilidades e nossas políticas de resposta.

## 🛡️ Versões Suportadas

Apenas a versão mais recente do Daci Bot recebe atualizações de segurança ativamente.

| Versão | Suporte de Segurança |
| ------ | -------------------- |
| 2.x    | ✅ Suportado         |
| 1.x    | ❌ Descontinuado     |
| < 1.0  | ❌ Descontinuado     |

## 🚨 Reportando Vulnerabilidades

### O Que Reportar

Por favor, reporte qualquer problema de segurança que você descobrir, incluindo mas não limitado a:

- 🔑 Exposição de tokens ou credenciais
- 🔓 Falhas de autenticação ou autorização
- 💉 Vulnerabilidades de injeção (SQL, XSS, command injection)
- 🗃️ Problemas de segurança no banco de dados
- 🔐 Falhas na criptografia ou armazenamento de dados sensíveis
- 🌐 Vulnerabilidades em dependências de terceiros
- 🤖 Exploits específicos de bots do Discord
- 📦 Problemas de segurança em APIs externas (OpenRouter, etc.)
- 💻 Execução remota de código (RCE)
- 🚪 Bypass de permissões ou rate limits

### Como Reportar

**⚠️ NÃO crie issues públicas para vulnerabilidades de segurança!**

Para reportar uma vulnerabilidade de forma segura:

1. **📧 Email Privado** (Recomendado)
   - Envie para: **[Seu email de segurança aqui]**
   - Assunto: `[SECURITY] Descrição breve da vulnerabilidade`
   - Inclua todos os detalhes técnicos possíveis

2. **🔐 GitHub Security Advisories** (Alternativa)
   - Acesse: https://github.com/fefelipe-7/daci/security/advisories/new
   - Preencha o formulário com detalhes da vulnerabilidade

3. **💬 Discord** (Para questões menores)
   - Entre em contato com os mantenedores diretamente
   - Use apenas para questões não-críticas

### Informações a Incluir

Para ajudar na resolução rápida, inclua:

```markdown
## Descrição da Vulnerabilidade
[Descrição clara e concisa]

## Tipo de Vulnerabilidade
[Ex: Injeção de código, exposição de dados, etc.]

## Componentes Afetados
[Ex: Módulo X, Arquivo Y, função Z]

## Passos para Reproduzir
1. [Primeiro passo]
2. [Segundo passo]
3. [Resultado observado]

## Impacto Estimado
[Crítico / Alto / Médio / Baixo]

## Prova de Conceito (PoC)
[Código ou screenshots, se aplicável]

## Sugestões de Correção
[Se você tiver ideias de como corrigir]

## Ambiente
- Versão do Daci Bot: [Ex: 2.0.0]
- Node.js: [Ex: 22.16.0]
- Sistema Operacional: [Ex: Ubuntu 22.04]
```

## ⏱️ Tempo de Resposta

Comprometemo-nos com os seguintes tempos de resposta:

| Severidade | Primeira Resposta | Resolução Esperada |
|------------|-------------------|-------------------|
| 🔴 Crítica  | 24 horas          | 7 dias            |
| 🟠 Alta     | 48 horas          | 14 dias           |
| 🟡 Média    | 72 horas          | 30 dias           |
| 🟢 Baixa    | 7 dias            | 60 dias           |

### Classificação de Severidade

**🔴 Crítica**
- Execução remota de código (RCE)
- Exposição massiva de dados
- Bypass completo de autenticação
- Vulnerabilidades com exploit público ativo

**🟠 Alta**
- Exposição de tokens/credenciais
- Escalação de privilégios
- Injeção de código (SQL, XSS, etc.)
- Acesso não autorizado a dados sensíveis

**🟡 Média**
- Bypass de rate limits
- Falhas de validação de entrada
- Problemas de configuração
- Vulnerabilidades que requerem interação do usuário

**🟢 Baixa**
- Vazamento mínimo de informações
- Questões de logging
- Problemas cosméticos de segurança

## 🔄 Processo de Resolução

1. **Recebimento** → Confirmação de recebimento em até 48h
2. **Validação** → Reprodução e análise da vulnerabilidade
3. **Desenvolvimento** → Criação de patch de segurança
4. **Testes** → Validação da correção em ambiente isolado
5. **Deploy** → Lançamento da correção
6. **Divulgação** → Publicação de advisory (após correção)

## 🏆 Programa de Reconhecimento

Embora não tenhamos um programa de bug bounty financeiro, reconhecemos publicamente colaboradores que reportam vulnerabilidades:

- 📜 Crédito no `SECURITY.md` e release notes
- 🎖️ Badge especial no Discord (se aplicável)
- 💬 Menção honrosa no `CHANGELOG.md`

### Hall da Fama de Segurança

_Agradecimentos especiais a pesquisadores de segurança que reportaram vulnerabilidades:_

<!-- Será atualizado conforme reportes -->
- _[Seu nome aqui após reportar uma vulnerabilidade válida]_

## 🔐 Boas Práticas para Usuários

### Proteção de Tokens

```env
# ❌ NUNCA faça isso:
# - Commitar .env no Git
# - Compartilhar tokens em Discord/Slack
# - Usar tokens em código público

# ✅ Sempre:
# - Use variáveis de ambiente
# - Rotacione tokens regularmente
# - Use .gitignore para .env
```

### Configuração Segura

```javascript
// ✅ Boas práticas:
- Valide todas as entradas do usuário
- Use rate limiting em comandos
- Implemente permissões adequadas
- Mantenha dependências atualizadas
- Use HTTPS para todas as APIs
```

### Auditoria Regular

```bash
# Execute auditorias de segurança regularmente:
npm audit
npm audit fix

# Verifique dependências desatualizadas:
npm outdated
```

## 🔍 Checklist de Segurança para Contribuidores

Antes de submeter código, verifique:

- [ ] Nenhuma credencial ou token hardcoded
- [ ] Validação adequada de inputs do usuário
- [ ] Tratamento correto de erros (sem expor stack traces)
- [ ] Uso de bibliotecas criptográficas para dados sensíveis
- [ ] Rate limiting implementado onde necessário
- [ ] Logs não contêm informações sensíveis
- [ ] Dependências atualizadas (sem CVEs conhecidos)
- [ ] Permissões do Discord corretamente configuradas

## 📚 Recursos de Segurança

### Documentação Relevante

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Discord Security Best Practices](https://discord.com/developers/docs/topics/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OpenRouter Security](https://openrouter.ai/docs/security)

### Ferramentas Recomendadas

- **npm audit** - Auditoria de dependências
- **Snyk** - Escaneamento de vulnerabilidades
- **ESLint Security Plugin** - Detecção de padrões inseguros
- **git-secrets** - Prevenção de commit de credenciais

## 🚫 Política de Divulgação

### Divulgação Coordenada

- ⏰ Pedimos **90 dias** após o reporte inicial para divulgação pública
- 🤝 Trabalharemos com você para um cronograma de divulgação
- 📢 Divulgaremos a vulnerabilidade após a correção ser deployada
- 🏅 Você será creditado (se desejar) no advisory público

### O Que NÃO Fazer

- ❌ Não explore a vulnerabilidade além do necessário para demonstrar o problema
- ❌ Não acesse, modifique ou destrua dados de outros usuários
- ❌ Não realize DoS ou DDoS contra a infraestrutura
- ❌ Não divulgue publicamente antes da correção
- ❌ Não use a vulnerabilidade para ganho pessoal ou malicioso

## 📞 Contatos de Segurança

**Equipe de Segurança**
- 📧 Email: [Seu email de segurança]
- 🐛 GitHub: [@fefelipe-7](https://github.com/fefelipe-7)
- 💬 Discord: [Link do servidor, se houver]

**Horário de Resposta**
- Segunda a Sexta: Respostas prioritárias
- Fins de semana: Resposta para casos críticos apenas

## 📝 Atualizações desta Política

Esta política de segurança pode ser atualizada periodicamente. Mudanças significativas serão comunicadas através de:

- 📢 Release notes do GitHub
- 💬 Anúncios no Discord (se aplicável)
- 📧 Notificações para reportadores anteriores

---

**Última atualização**: Outubro 2025  
**Versão**: 1.0

**Agradecemos** sua contribuição para manter o Daci Bot seguro! 🙏

## 🔗 Links Úteis

- [Código de Conduta](CODE_OF_CONDUCT.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Documentação](README.md)
- [Issues no GitHub](https://github.com/fefelipe-7/daci/issues)

