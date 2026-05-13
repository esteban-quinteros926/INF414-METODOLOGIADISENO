from fastapi import FastAPI
from routers import incidencias
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MS Incidencias")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidencias.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
