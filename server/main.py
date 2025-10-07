from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.api import planning, forces, ttr, exports, audit, factors
from server.db.base import init_db

app = FastAPI(title="COPDify", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(planning.router, prefix="/api")
app.include_router(forces.router, prefix="/api")
app.include_router(ttr.router, prefix="/api")
app.include_router(exports.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(factors.router, prefix="/api")


@app.on_event("startup")
async def startup_event() -> None:
    init_db()


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
