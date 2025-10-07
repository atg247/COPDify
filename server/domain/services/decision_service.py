from __future__ import annotations

from typing import List

from sqlmodel import Session, select

from server.db.models import AuditLog, Decision
from server.domain import schemas


class DecisionService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create_decision(self, payload: schemas.DecisionCreate) -> Decision:
        decision = Decision(**payload.model_dump())
        self.session.add(decision)
        self.session.commit()
        self.session.refresh(decision)

        audit = AuditLog(plan_id=decision.plan_id, action="decision_recorded", payload=decision.decision_text)
        self.session.add(audit)
        self.session.commit()
        return decision

    def list_decisions(self, plan_id: int | None = None) -> List[Decision]:
        statement = select(Decision)
        if plan_id:
            statement = statement.where(Decision.plan_id == plan_id)
        return list(self.session.exec(statement).all())


__all__ = ["DecisionService"]
