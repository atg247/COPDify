from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.server.db.base import get_session
from app.server.domain import schemas
from app.server.domain.services.factor_service import FactorService

router = APIRouter(prefix="/factors", tags=["Factor Analysis"])


def _service(session: Session) -> FactorService:
    return FactorService(session)


@router.post("/", response_model=schemas.FactorRead)
def create_factor(payload: schemas.FactorCreate, session: Session = Depends(get_session)):
    service = _service(session)
    factor = service.create_factor(payload)
    return schemas.FactorRead.model_validate(factor)


@router.get("/", response_model=list[schemas.FactorRead])
def list_factors(plan_id: int | None = Query(default=None), session: Session = Depends(get_session)):
    service = _service(session)
    factors = service.list_factors(plan_id=plan_id)
    return [schemas.FactorRead.model_validate(f) for f in factors]


@router.post("/{factor_id}/deductions")
def add_deduction(factor_id: int, payload: schemas.FactorDeductionCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        deduction = service.add_deduction(factor_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return deduction


@router.post("/{factor_id}/conclusions")
def add_conclusion(factor_id: int, payload: schemas.FactorConclusionCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        conclusion = service.add_conclusion(factor_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return conclusion


@router.post("/conclusions/{conclusion_id}/links")
def link_conclusion(conclusion_id: int, payload: schemas.ConclusionLinkCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        link = service.link_conclusion(conclusion_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return link


@router.post("/conclusions/{conclusion_id}/status")
def set_conclusion_status(conclusion_id: int, payload: schemas.ConclusionStatusUpdate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        conclusion = service.update_conclusion_status(conclusion_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return conclusion


@router.get("/conclusions/{conclusion_id}/trace", response_model=schemas.TraceResponse)
def get_trace(conclusion_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        return service.build_trace(conclusion_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
