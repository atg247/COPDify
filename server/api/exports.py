from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.server.db.base import get_session
from app.server.domain import schemas
from app.server.domain.services.export_service import ExportService

router = APIRouter(prefix="/exports", tags=["Exports"])


def _service(session: Session) -> ExportService:
    return ExportService(session)


@router.post("/conops", response_model=schemas.ConopsExportResponse)
def generate_conops(payload: schemas.ConopsExportRequest, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        return service.generate_conops(payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
