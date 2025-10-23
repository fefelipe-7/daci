# Script de Setup Git para DACI Discord Bot (PowerShell)
# Execute: .\scripts\git-setup.ps1

Write-Host "🚀 DACI Discord Bot - Setup Git" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o git está inicializado
if (-not (Test-Path .git)) {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git inicializado!" -ForegroundColor Green
} else {
    Write-Host "✅ Repositório Git já inicializado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Preparando commit..." -ForegroundColor Yellow

# Adicionar todos os arquivos
git add .

# Commit inicial
$commitMessage = @"
🎉 feat: versão 2.0.0 - projeto completamente reorganizado

- Estrutura modular e organizada
- Documentação completa (README, CONTRIBUTING, CHANGELOG)
- Sistema de personalidades dinâmicas
- Sistema de música multi-plataforma
- Comandos de moderação, diversão e utilidades
- Templates GitHub para issues e PRs
- Licença MIT adicionada
- Configuração profissional para produção
"@

git commit -m $commitMessage

Write-Host ""
Write-Host "✅ Commit criado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Crie um repositório no GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Execute os comandos (substitua SEU-USUARIO):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/SEU-USUARIO/daci-discord-bot.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Pronto! Veja mais detalhes em DEPLOY_GITHUB.md" -ForegroundColor Green

