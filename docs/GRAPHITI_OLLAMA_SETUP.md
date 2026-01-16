# Graphiti + Ollama Setup for Neo-Tokyo: Rival Academies

This document describes how to run Graphiti with Ollama for the Auto-Claude memory integration in this project.

## Prerequisites

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Or download from https://ollama.ai
```

### 2. Start Ollama

```bash
ollama serve
```

### 3. Pull Required Models

```bash
# LLM Model (for entity extraction)
ollama pull deepseek-r1:7b

# Embedding Model (for semantic search)
ollama pull qwen3-embedding:8b

# Alternative smaller embedding model
ollama pull nomic-embed-text
```

### 4. Verify Models

```bash
ollama list
```

You should see:
- `deepseek-r1:7b` - LLM for entity extraction (~4.7 GB)
- `qwen3-embedding:8b` - Embeddings for semantic search (~4.7 GB)

## Configuration

The configuration is in `.auto-claude/.env`:

```bash
# Memory Integration
GRAPHITI_ENABLED=true
GRAPHITI_EMBEDDER_PROVIDER=ollama

# Ollama Settings
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=qwen3-embedding:8b
OLLAMA_EMBEDDING_DIM=4096

# LLM Settings
OLLAMA_LLM_MODEL=deepseek-r1:7b
LLM_TEMPERATURE=0.1
LLM_MAX_TOKENS=8192
```

## Alternative Configurations

### Smaller Embedding Model (Faster, Less Memory)

```bash
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_EMBEDDING_DIM=768
```

### Different LLM Models

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| `deepseek-r1:7b` | 4.7 GB | Medium | High |
| `llama3.2:3b` | 2.0 GB | Fast | Medium |
| `mistral:7b` | 4.1 GB | Medium | High |
| `qwen2.5:7b` | 4.4 GB | Medium | High |

## Troubleshooting

### Ollama Not Responding

```bash
# Check if running
curl http://localhost:11434/v1/models

# Start if needed
ollama serve
```

### Out of Memory

- Use smaller models (`nomic-embed-text` instead of `qwen3-embedding:8b`)
- Close other GPU-intensive applications
- Set `LLM_MAX_TOKENS=4096` for lower memory usage

### Slow Performance

- Lower concurrency: Add `SEMAPHORE_LIMIT=5` to `.auto-claude/.env`
- Use faster models with fewer parameters

## Verifying Setup

Run this to test the Ollama connection:

```bash
# Test LLM
curl http://localhost:11434/api/generate -d '{"model": "deepseek-r1:7b", "prompt": "Hello"}'

# Test Embeddings
curl http://localhost:11434/api/embeddings -d '{"model": "qwen3-embedding:8b", "prompt": "test"}'
```

## Integration with Auto-Claude

Once configured, Auto-Claude will automatically use Graphiti for:

1. **Memory Storage** - Stores context and decisions in a knowledge graph
2. **Semantic Search** - Retrieves relevant past context
3. **Entity Extraction** - Identifies key concepts and relationships

The memory data is stored in `~/.auto-claude/memories/` by default.
