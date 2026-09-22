# Chat Bot SaaS

FastAPI backend for a chatbot SaaS.

## Setup

```bash
source bin/activate            # venv lives in the project root
uv pip install -r requirements.txt
cp .env.example .env           # then fill in your keys
```

## Run

```bash
uvicorn app.main:app --reload
```

Health check: http://localhost:8000/health

## Test

```bash
pytest
```
