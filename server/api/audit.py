from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.server.db.base import get_session
from app.server.db.models import AuditLog
from app.server.domain import schemas
from app.server.domain.services.decision_service import DecisionService

router = APIRouter(tags=["Decisions & Audit"])


def _decision_service(session: Session) -> DecisionService:
    return DecisionService(session)


@router.post("/decisions", response_model=schemas.DecisionRead)
def create_decision(payload: schemas.DecisionCreate, session: Session = Depends(get_session)):
    service = _decision_service(session)
    decision = service.create_decision(payload)
    return schemas.DecisionRead.model_validate(decision)


@router.get("/decisions", response_model=list[schemas.DecisionRead])
def list_decisions(plan_id: int | None = None, session: Session = Depends(get_session)):
    service = _decision_service(session)
    decisions = service.list_decisions(plan_id=plan_id)
    return [schemas.DecisionRead.model_validate(decision) for decision in decisions]


@router.get("/audit/logs")
def list_audit_logs(session: Session = Depends(get_session)):
    return session.exec(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100)).all()
