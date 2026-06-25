# YVY AI — Svelte

Dashboard agrícola con chat RAG y visualización de sensores, construido con SvelteKit y JavaScript puro (sin TypeScript).

> Reimplementación en Svelte de [YVY-chat](https://github.com/GonzaloAvila27/YVY-chat) con entorno de desarrollo en Nix mediante flakes y devShell.

## ¿Qué hace?

- **Chat RAG**: hacé preguntas sobre tus cultivos y el sistema responde usando documentación local + Ollama (phi3).
- **Gráficos KPI**: visualización de humedad/temperatura por lote y tendencia de 24 horas de suelo vs. aire.

## Requisitos

- [Nix](https://nixos.org/) con flakes habilitados
- [Ollama](https://ollama.com/) (incluido en el devShell)
- Los modelos `phi3:latest` y `nomic-embed-text`

## Primeros pasos

```bash
# 1. Entrá al entorno de desarrollo
nix develop

# 2. (Solo la primera vez) bajá los modelos
ollama pull phi3:latest
ollama pull nomic-embed-text

# 3. En una terminal aparte, levantá Ollama
ollama serve

# 4. Instalá dependencias y arrancá
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

## Estructura

```
src/
├── data/               # Documentos de conocimiento (.md) — editá o agregá archivos acá
├── lib/server/
│   ├── ollama.js       # Cliente HTTP para Ollama
│   └── rag.js          # RAG: chunking, embeddings, búsqueda por similitud coseno
└── routes/
    ├── +layout.svelte  # Navbar
    ├── +page.svelte    # Dashboard principal
    └── api/
        ├── chat/       # POST /api/chat
        └── rebuild/    # POST /api/rebuild
static/data/            # CSVs de sensores (kpi_bar.csv, kpi_line.csv)
```

## Agregar conocimiento

Copiá archivos `.md` o `.txt` a `src/data/`. El índice RAG se construye la primera vez que se hace una consulta y queda en memoria. Para forzar una reconstrucción sin reiniciar:

```bash
curl -X POST http://localhost:5173/api/rebuild
```

## Variables de entorno

| Variable       | Default                    | Descripción              |
|----------------|----------------------------|--------------------------|
| `OLLAMA_HOST`  | `http://127.0.0.1:11434`   | URL del servidor Ollama  |
| `OLLAMA_MODEL` | `phi3:latest`              | Modelo de generación     |
