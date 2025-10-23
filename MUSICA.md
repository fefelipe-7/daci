# 🎵 Sistema de Música - Guia Completo

## 🚀 Características

O sistema de música foi implementado seguindo o modelo do **Jockie Music**, com suporte a múltiplas plataformas:

- ✅ **Spotify** (extrai metadados + busca no YouTube)
- ✅ **YouTube** (streaming direto)
- ✅ **SoundCloud** (streaming direto)
- ✅ **Busca por nome** (busca no YouTube)

### Sistema Híbrido Spotify

Quando você cola um link do Spotify:
1. Bot extrai informações da música (nome, artista, capa)
2. Busca a mesma música no YouTube
3. Toca o áudio do YouTube
4. Mostra informações do Spotify

Isso é **legal**, **gratuito** e funciona igual ao Jockie Music!

## 📋 Comandos Disponíveis

### `/play <música>`
Toca música de qualquer plataforma ou busca por nome.

**Exemplos:**
```
/play https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
/play https://soundcloud.com/artist/track
/play never gonna give you up
```

**Funcionamento:**
- Se fila vazia: cria fila e começa a tocar
- Se já tocando: adiciona à fila

### `/pause`
Pausa a música atual.

### `/resume`
Retoma a música pausada.

### `/skip`
Pula a música atual.

**Sistema de Votação:**
- 1-2 pessoas no canal: skip direto
- 3+ pessoas: precisa de 50% de votos

### `/stop`
Para toda a reprodução e limpa a fila.

### `/queue [página]`
Mostra a fila de músicas com paginação.

**Informações mostradas:**
- Música atual tocando
- Próximas músicas (10 por página)
- Status (loop, shuffle, volume)
- Total de músicas

### `/volume <0-100>`
Ajusta o volume da reprodução.

**Exemplos:**
```
/volume 50
/volume 100
/volume 25
```

### `/loop <modo>`
Ativa/desativa loop.

**Modos:**
- `off` - Desativa loop
- `song` - Loop apenas música atual
- `queue` - Loop fila inteira

### `/shuffle`
Embaralha a fila de músicas (não afeta música atual).

### `/np`
Mostra informações detalhadas da música atual.

**Informações:**
- Título e artista
- Duração
- Plataforma original (Spotify, YouTube, SoundCloud)
- Volume
- Status de loop
- Link original

## 🎮 Botões Interativos

Quando uma música começa a tocar, o bot envia botões interativos:

- ⏸️ **Pausar** - Pausa/retoma música
- ⏭️ **Pular** - Registra voto para pular
- ⏹️ **Parar** - Para tudo e limpa fila

## 🎯 Funcionalidades Avançadas

### Sistema de Fila Multi-Servidor
Cada servidor tem sua própria fila independente. O bot pode tocar em vários servidores ao mesmo tempo.

### Sistema de Votação Inteligente
- Calcula automaticamente quantos votos são necessários (50%)
- Reseta votos quando música muda
- Skip direto se apenas 1-2 pessoas

### Loop Flexível
- Loop de música individual
- Loop de fila inteira
- Desativado

### Cache Inteligente
O bot guarda em cache as buscas do Spotify → YouTube para ser mais rápido.

### Limpeza Automática
Quando a fila acaba, o bot:
1. Para reprodução
2. Desconecta do canal de voz
3. Limpa recursos
4. Remove fila da memória

## 🔧 Estrutura Técnica

### Arquivos Criados

```
music/
├── MusicQueue.js         # Classe de fila por servidor
├── QueueManager.js       # Gerenciador global de filas
├── PlatformDetector.js   # Detecta plataforma (Spotify, YouTube, etc)
├── MusicProcessor.js     # Processa URLs e busca
└── MusicPlayer.js        # Reprodução e controles

commands/music/
├── play.js              # Comando /play (atualizado)
├── pause.js             # Comando /pause (atualizado)
├── resume.js            # Comando /resume (atualizado)
├── skip.js              # Comando /skip (novo)
├── stop.js              # Comando /stop (atualizado)
├── queue.js             # Comando /queue (atualizado)
├── volume.js            # Comando /volume (atualizado)
├── loop.js              # Comando /loop (novo)
├── shuffle.js           # Comando /shuffle (novo)
└── np.js                # Comando /np (atualizado)

events/
└── buttonInteraction.js # Handler de botões interativos
```

### Dependências Utilizadas

- `play-dl` - Player multi-plataforma
- `spotify-url-info` - Metadados do Spotify
- `youtube-sr` - Busca no YouTube
- `@discordjs/voice` - Conexão de voz Discord
- `ffmpeg-static` - Processamento de áudio

## 🎬 Como Usar

### 1. Entre em um canal de voz

### 2. Use /play com qualquer plataforma

**Spotify:**
```
/play https://open.spotify.com/track/...
```

**YouTube:**
```
/play https://www.youtube.com/watch?v=...
```

**SoundCloud:**
```
/play https://soundcloud.com/...
```

**Busca por nome:**
```
/play imagine dragons bones
```

### 3. Controle a reprodução

Use os comandos ou os botões interativos!

## ⚠️ Limitações

### Spotify
- Não toca **diretamente** do Spotify
- Busca e toca a **mesma música** do YouTube
- Pode tocar versões diferentes (live, cover, remix)

### YouTube
- Respeita rate limits da API
- Vídeos privados/bloqueados não funcionam

### SoundCloud
- Algumas faixas podem estar bloqueadas por região

## 🐛 Troubleshooting

### Bot não entra no canal de voz
- Verifique permissões: Connect, Speak
- Confirme se o bot está online
- Tente desconectar e reconectar

### Música não toca
- Verifique se é uma URL válida
- Tente buscar por nome em vez de URL
- Veja logs no console para detalhes

### Bot desconecta sozinho
- Normal após fila acabar
- Use /loop para manter tocando

### Erro ao buscar Spotify
- Aguarde alguns segundos e tente novamente
- A música pode não estar disponível no YouTube

## 🎉 Pronto!

Agora você tem um sistema de música completo **estilo Jockie Music** com:
- ✅ Múltiplas plataformas
- ✅ Sistema de fila avançado
- ✅ Controles completos
- ✅ Botões interativos
- ✅ Sistema de votação
- ✅ Loop e shuffle

Aproveite! 🎵

