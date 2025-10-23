# 🧪 Testes do Sistema de Música

## 📝 Como Testar

Depois de registrar os comandos com `node deploy-commands.js` e iniciar o bot com `npm start`:

### 1. Entre em um canal de voz no Discord

### 2. Teste cada plataforma:

#### ✅ Teste Spotify
```
/play https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
```
*Deve extrair info do Spotify e buscar no YouTube*

#### ✅ Teste YouTube
```
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
*Deve tocar direto do YouTube*

#### ✅ Teste SoundCloud
```
/play https://soundcloud.com/[qualquer_track_valida]
```
*Deve tocar direto do SoundCloud*

#### ✅ Teste Busca por Nome
```
/play imagine dragons bones
/play never gonna give you up
/play bohemian rhapsody
```
*Deve buscar no YouTube e tocar primeiro resultado*

### 3. Teste os Controles

```
/pause          # Pausar música
/resume         # Retomar música
/volume 25      # Ajustar volume para 25%
/volume 100     # Ajustar volume para 100%
/np             # Ver música atual
```

### 4. Teste a Fila

```
# Adicione várias músicas:
/play https://www.youtube.com/watch?v=...
/play never gonna give you up
/play imagine dragons bones

# Veja a fila:
/queue

# Controle a fila:
/skip           # Pular música
/shuffle        # Embaralhar
/loop song      # Loop música atual
/loop queue     # Loop fila inteira
/loop off       # Desativar loop
```

### 5. Teste Sistema de Votação

```
# Com 3+ pessoas no canal de voz:
/skip
# Cada pessoa precisa votar
# 50% dos votos = música pula
```

### 6. Teste Botões Interativos

Quando uma música começar a tocar, clique nos botões:
- ⏸️ Pausar/Retomar
- ⏭️ Pular (registra voto)
- ⏹️ Parar tudo

### 7. Teste Limpeza Automática

```
# Deixe a fila acabar naturalmente
# O bot deve:
# 1. Avisar que a fila acabou
# 2. Desconectar do canal
# 3. Limpar recursos
```

## ✅ Checklist de Testes

- [ ] Spotify funciona (extrai info + busca YouTube)
- [ ] YouTube funciona (toca direto)
- [ ] SoundCloud funciona (toca direto)
- [ ] Busca por nome funciona
- [ ] Fila adiciona músicas
- [ ] Pause/Resume funciona
- [ ] Skip funciona (direto e com votação)
- [ ] Volume funciona
- [ ] Loop música funciona
- [ ] Loop fila funciona
- [ ] Shuffle funciona
- [ ] Queue mostra fila corretamente
- [ ] Now Playing mostra info correta
- [ ] Botões interativos funcionam
- [ ] Limpeza automática funciona
- [ ] Multi-servidor funciona (teste em 2 servidores)

## 🐛 Problemas Conhecidos

### Spotify pode não encontrar no YouTube
**Motivo:** Música não está disponível no YouTube
**Solução:** Tentar outra música ou buscar direto no YouTube

### Erro "Cannot read properties of undefined"
**Motivo:** Dependências não instaladas corretamente
**Solução:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Bot não entra no canal
**Motivo:** Permissões insuficientes
**Solução:** Verifique permissões Connect e Speak

### Áudio com delay/lag
**Motivo:** Conexão lenta
**Solução:** Ajustar qualidade ou usar servidor com melhor conexão

## 📊 Logs Úteis

O bot mostra logs no console:
- `🎵 Plataforma detectada: spotify` - Plataforma identificada
- `🔍 Buscando no YouTube: ...` - Buscando música
- `💾 Usando cache para: ...` - Cache funcionando
- `🎵 Tocando: ...` - Música começou
- `🧹 Limpando fila...` - Fila acabou

## 🎉 Sucesso!

Se todos os testes passarem, seu sistema de música está funcionando perfeitamente como o Jockie Music! 🎵

