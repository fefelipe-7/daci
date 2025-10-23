#!/bin/bash

# Script de Setup Git para DACI Discord Bot
# Execute: bash scripts/git-setup.sh

echo "🚀 DACI Discord Bot - Setup Git"
echo "================================"
echo ""

# Verificar se o git está inicializado
if [ ! -d .git ]; then
    echo "📦 Inicializando repositório Git..."
    git init
    echo "✅ Git inicializado!"
else
    echo "✅ Repositório Git já inicializado!"
fi

echo ""
echo "📝 Preparando commit..."

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "🎉 feat: versão 2.0.0 - projeto completamente reorganizado

- Estrutura modular e organizada
- Documentação completa (README, CONTRIBUTING, CHANGELOG)
- Sistema de personalidades dinâmicas
- Sistema de música multi-plataforma
- Comandos de moderação, diversão e utilidades
- Templates GitHub para issues e PRs
- Licença MIT adicionada
- Configuração profissional para produção"

echo ""
echo "✅ Commit criado!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Crie um repositório no GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Execute os comandos (substitua SEU-USUARIO):"
echo "   git remote add origin https://github.com/SEU-USUARIO/daci-discord-bot.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🎉 Pronto! Veja mais detalhes em DEPLOY_GITHUB.md"

