from __future__ import annotations

from typing import List

from sqlmodel import Session, select

from app.server.db.models import Area, COA, Plan, Phase, Task, TTL, TaskCategory
from app.server.domain import schemas


class PlanningService:
    def __init__(self, session: Session) -> None:
        self.session = session

    # Plans
    def create_plan(self, data: schemas.PlanCreate) -> Plan:
        plan = Plan(**data.model_dump())
        self.session.add(plan)
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def list_plans(self) -> List[Plan]:
        return list(self.session.exec(select(Plan)).all())

    def get_plan(self, plan_id: int) -> Plan:
        plan = self.session.get(Plan, plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        return plan

    # Phases
    def create_phase(self, plan_id: int, data: schemas.PhaseCreate) -> Phase:
        plan = self.get_plan(plan_id)
        phase = Phase(plan_id=plan.id, **data.model_dump())
        self.session.add(phase)
        self.session.commit()
        self.session.refresh(phase)
        return phase

    # COAs
    def create_coa(self, plan_id: int, data: schemas.COACreate) -> COA:
        plan = self.get_plan(plan_id)
        coa = COA(plan_id=plan.id, **data.model_dump())
        self.session.add(coa)
        self.session.commit()
        self.session.refresh(coa)
        return coa

    # Areas
    def create_area(self, plan_id: int, data: schemas.AreaCreate) -> Area:
        plan = self.get_plan(plan_id)
        area = Area(plan_id=plan.id, **data.model_dump())
        self.session.add(area)
        self.session.commit()
        self.session.refresh(area)
        return area

    # Tasks
    def create_task(self, plan_id: int, data: schemas.TaskCreate) -> Task:
        plan = self.get_plan(plan_id)
        payload = data.model_dump()
        payload["plan_id"] = plan.id
        category_value = payload.pop("category", TaskCategory.ASSIGNED.value).lower()
        payload["category"] = TaskCategory(category_value)
        task = Task(**payload)
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def list_tasks(self, plan_id: int) -> List[Task]:
        statement = select(Task).where(Task.plan_id == plan_id)
        return list(self.session.exec(statement).all())

    # TTL
    def create_ttl(self, plan_id: int, data: schemas.TTLCreate) -> TTL:
        plan = self.get_plan(plan_id)
        ttl = TTL(plan_id=plan.id, **data.model_dump(exclude_none=True))
        self.session.add(ttl)
        self.session.commit()
        self.session.refresh(ttl)
        return ttl

    def get_ttl(self, ttl_id: int) -> TTL:
        ttl = self.session.get(TTL, ttl_id)
        if not ttl:
            raise ValueError(f"TTL {ttl_id} not found")
        return ttl

    def list_ttl_for_plan(self, plan_id: int) -> List[TTL]:
        statement = select(TTL).where(TTL.plan_id == plan_id)
        return list(self.session.exec(statement).all())


__all__ = ["PlanningService"]
