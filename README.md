# Meeting Recorder PWA

Mobile-first Progressive Web App para gravar reuniões no telemóvel e
transcrever via **Mistral Voxtral REST** directamente — sem servidor
intermédio, sem dependência do Mac.

## Características

- 🎙 **Gravação local** com `MediaRecorder` API (WebM/Opus em Android, M4A/AAC em iOS)
- 📥 **Storage local** via IndexedDB (até GBs de áudio)
- 🌐 **Transcrição via Voxtral REST** — chamada directa à Mistral cloud
- 🔑 **Multi-key rotation** client-side (mesma lógica que `mistral_keys.py`)
- 🌙 **Background recording** com WakeLock (Android) e silent-audio trick (iOS, ~10 min)
- 📤 **Share nativo** — AirDrop, iCloud Drive, WhatsApp, Mail
- 🔒 **Privacy**: áudio fica no telemóvel; só sai para Mistral se tu accionares "Transcrever"
- 📴 **Offline-first**: ServiceWorker faz cache do shell. Gravas em qualquer sítio sem net; transcreves quando voltares à net.

## Estrutura

```
mobile-recorder/
├── index.html          single-file app (HTML + CSS + JS embedded)
├── manifest.json       PWA manifest (installable)
├── sw.js               ServiceWorker (offline shell)
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md           (este ficheiro)
```

## Deploy — GitHub Pages (recomendado)

1. Cria um repo público no GitHub (ex: `meeting-recorder`).
2. Copia o conteúdo de `mobile-recorder/` para a raíz do repo.
3. No repo, vai a **Settings → Pages**:
   - Source: `Deploy from a branch`
   - Branch: `main` (ou `master`) + `/` (root)
4. Aguarda ~1 min. Recebes URL do tipo `https://<utilizador>.github.io/meeting-recorder/`.
5. **Abre essa URL no Safari iPhone / Chrome Android** e faz "Add to Home Screen".

## Alternativas de hosting

- **Cloudflare Pages**: drag-and-drop da pasta no dashboard. HTTPS automático.
- **Vercel**: `npx vercel --prod` na pasta. Free tier suporta.
- **Netlify Drop**: drag-and-drop em https://app.netlify.com/drop
- **Self-hosting via Tailscale**: lança um `python -m http.server 8443` no Mac, expõe via Tailscale Serve.

## Setup no telemóvel

1. Abre a URL no browser do telemóvel.
2. **Add to Home Screen** (Safari iOS) ou **Install app** (Chrome Android).
3. Abre o ícone instalado.
4. Tap no `🔑` topo direito → cola a tua API key Mistral (uma chave por linha; suporta múltiplas para rotação).
5. Tap no `🌐` → escolhe idioma (ou deixa "auto-detect").
6. Tap no profile field → escreve a tag da reunião (ex: `FIA · Sonae`, `REM`).

## Como usar

1. Tap o botão vermelho grande → ▶ inicia gravação.
2. **Android**: podes desligar ecrã, recordings continuam.
3. **iOS**: mantém Safari em foreground (ecrã pode estar dim). Em background, ~10 min antes de Safari matar.
4. Tap o botão (agora um quadrado) → ⏹ para gravar.
5. A gravação aparece na lista com status "⏳ pendente".
6. Tap **🌐 Transcrever** → ~70s para 1h de áudio.
7. Tap **📤 Share** → envia áudio + transcrição (.md) via AirDrop / iCloud / WhatsApp / Mail.

## Limitações iOS

| Problema | Workaround |
|---|---|
| Safari mata audio em background após ~10 min | Mantém em foreground com ecrã dim |
| Não suporta `wakeLock` API | Usa silent-audio trick (built-in) |
| MediaRecorder só suporta MP4/AAC | App detecta e usa o codec certo |

Para reuniões longas (1h+) com ecrã totalmente off, considera Voice
Memos nativa (ilimitado em background) + AirDrop para Mac depois.

## Segurança da API key

A key fica em `localStorage` do browser, **só visível para apps abertas
no mesmo domínio** (GitHub Pages domain). Quem aceder ao teu telemóvel
sem PIN/Face ID pode abrir Safari → DevTools → ver a key.

Se quiseres esconder completamente, usa o pattern Cloudflare Worker
proxy (não implementado aqui — adiciona ~30 linhas no Worker e altera o
`MISTRAL_API_URL` no JS para apontar para o worker).

## Custo

- Mistral free-tier: ~1 B tokens/dia → suporta dezenas de reuniões 1h
- GitHub Pages: free
- Telemóvel: bateria + bytes mobile (~30 MB por hora de áudio uploaded)

## Troubleshooting

**"Permissão de microfone negada"** — vai a Settings do telemóvel:
- iOS: `Settings → Safari → Microphone → Allow`
- Android: `Settings → Apps → Chrome → Permissions → Microphone → Allow`

**Áudio cortado em background (iOS)** — confirma que tens som "Silent
audio" a tocar (Web Audio API). Se Safari foi suspendido, perdeste a
sessão; só conseguirás gravar com Safari activo.

**429 / rate-limit** — adiciona mais chaves Mistral em `🔑`. Rotação
automática protege-te.

**Transcrição inglesa quando reunião era PT** — Voxtral auto-detecta
mas pode falhar em sotaques difíceis. Define `🌐 → Português` antes de
gravar.

## Roadmap futuro

- [ ] **Live transcription** via Voxtral Realtime WebSocket (chunks contínuos durante gravação)
- [ ] **Cloudflare Worker proxy** para esconder API key
- [ ] **Sync directo com app Mac** via Tailscale + drop na pasta certa
- [ ] **Background sync** quando voltas à net (auto-transcreve pendentes)
- [ ] **Push notifications** quando transcrição termina
- [ ] **Multi-language UI** (actual é PT-PT only)

## Licença

Uso pessoal. Sem licença pública.
