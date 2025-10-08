from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from server.db.base import get_session
from server.domain import schemas
from server.domain.services.factor_service import FactorService

router = APIRouter(prefix="/factors", tags=["Factor Analysis"])


def _service(session: Session) -> FactorService:
    return FactorService(session)


@router.post("/", response_model=schemas.FactorRead)
def create_factor(payload: schemas.FactorCreate, session: Session = Depends(get_session)):
    service = _service(session)
    factor = service.create_factor(payload)
    return schemas.FactorRead.model_validate(factor)


@router.get("", response_model=list[schemas.FactorRead])
@router.get("/", response_model=list[schemas.FactorRead])
def list_factors(plan_id: int | None = Query(default=None), session: Session = Depends(get_session)):
    service = _service(session)
    factors = service.list_factors(plan_id=plan_id)
    return [schemas.FactorRead.model_validate(f) for f in factors]


@router.get("/{factor_id}/full")
def get_factor_full(factor_id: int, session: Session = Depends(get_session)):
    """Get factor with all deductions and conclusions"""
    from server.db.models.core import Factor, FactorDeduction, FactorConclusion
    from sqlmodel import select

    # Get factor
    factor = session.get(Factor, factor_id)
    if not factor:
        raise HTTPException(status_code=404, detail=f"Factor {factor_id} not found")

    # Get all deductions for this factor
    deduction_stmt = select(FactorDeduction).where(FactorDeduction.factor_id == factor_id)
    deductions = session.exec(deduction_stmt).all()

    # Get all conclusions for this factor
    conclusion_stmt = select(FactorConclusion).where(FactorConclusion.factor_id == factor_id)
    conclusions = session.exec(conclusion_stmt).all()

    # Convert to dicts
    deductions_list = []
    for ded in deductions:
        ded_dict = {
            "id": ded.id,
            "factor_id": ded.factor_id,
            "text": ded.text,
            "confidence": ded.confidence,
            "created_at": ded.created_at.isoformat()
        }
        deductions_list.append(ded_dict)

    conclusions_list = []
    for con in conclusions:
        # Get link count for this conclusion
        from server.db.models.core import ConclusionLink
        link_stmt = select(ConclusionLink).where(ConclusionLink.conclusion_id == con.id)
        links = session.exec(link_stmt).all()

        con_dict = {
            "id": con.id,
            "factor_id": con.factor_id,
            "deduction_id": con.deduction_id,
            "type": con.type.value,
            "text": con.text,
            "priority": con.priority,
            "status": con.status.value,
            "owner": con.owner,
            "created_at": con.created_at.isoformat(),
            "has_links": len(links) > 0
        }
        conclusions_list.append(con_dict)

    return {
        "factor": schemas.FactorRead.model_validate(factor),
        "deductions": deductions_list,
        "conclusions": conclusions_list
    }


@router.delete("/{factor_id}")
def delete_factor(factor_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        service.delete_factor(factor_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "deleted"}


@router.post("/{factor_id}/deductions")
def add_deduction(factor_id: int, payload: schemas.FactorDeductionCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        deduction = service.add_deduction(factor_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return deduction


@router.delete("/deductions/{deduction_id}")
def delete_deduction(deduction_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        service.delete_deduction(deduction_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "deleted"}


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


@router.delete("/conclusions/{conclusion_id}")
def delete_conclusion(conclusion_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        service.delete_conclusion(conclusion_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "deleted"}


@router.post("/conclusions/{conclusion_id}/status")
def set_conclusion_status(conclusion_id: int, payload: schemas.ConclusionStatusUpdate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        conclusion = service.update_conclusion_status(conclusion_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return conclusion
