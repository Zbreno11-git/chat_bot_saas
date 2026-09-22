from fastapi import FastAPI

app = FastAPI(title="Chat Bot SaaS")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
