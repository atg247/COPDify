from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.server.db.base import get_session
from app.server.domain import schemas
from app.server.domain.services.ttr_service import TTRService

router = APIRouter(prefix="/ttr", tags=["Troop-to-Task"])


def _service(session: Session) -> TTRService:
    return TTRService(session)


@router.post("/apply", response_model=schemas.TTRApplyResponse)
def apply_ttr(payload: schemas.TTRApplyRequest, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        return service.apply_rule(payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
