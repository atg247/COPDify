from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from server.db.base import get_session
from server.domain import schemas
from server.domain.services.plan_service import PlanningService

router = APIRouter(prefix="/plans", tags=["Planning"])


def _service(session: Session) -> PlanningService:
    return PlanningService(session)


@router.post("/", response_model=schemas.PlanRead)
def create_plan(plan_in: schemas.PlanCreate, session: Session = Depends(get_session)):
    plan = _service(session).create_plan(plan_in)
    return schemas.PlanRead.model_validate(plan)


@router.get("/", response_model=list[schemas.PlanRead])
def list_plans(session: Session = Depends(get_session)):
    service = _service(session)
    return [schemas.PlanRead.model_validate(plan) for plan in service.list_plans()]


@router.get("/{plan_id}")
def get_plan(plan_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        plan = service.get_plan(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    phases = [schemas.PhaseRead.model_validate(phase) for phase in plan.phases]
    coas = [schemas.COARead.model_validate(coa) for coa in plan.coas]
    tasks = [schemas.TaskRead.model_validate(task) for task in plan.tasks]
    ttl_items = [schemas.TTLRead.model_validate(ttl) for ttl in plan.ttl_items]
    risks = [schemas.RiskRead.model_validate(risk) for risk in plan.risks]
    decisive_conditions = [schemas.DecisiveConditionRead.model_validate(dc) for dc in plan.decisive_conditions]
    decision_points = [schemas.DecisionPointRead.model_validate(dp) for dp in plan.decision_points]
    constraints = [schemas.ConstraintRead.model_validate(c) for c in plan.constraints]
    assumptions = [schemas.AssumptionRead.model_validate(a) for a in plan.assumptions]
    ccirs = [schemas.CCIRRead.model_validate(ccir) for ccir in plan.ccirs]

    return {
        "plan": schemas.PlanRead.model_validate(plan),
        "phases": phases,
        "coas": coas,
        "tasks": tasks,
        "ttl": ttl_items,
        "risks": risks,
        "decisive_conditions": decisive_conditions,
        "decision_points": decision_points,
        "constraints": constraints,
        "assumptions": assumptions,
        "ccirs": ccirs,
    }


@router.post("/{plan_id}/phases", response_model=schemas.PhaseRead)
def create_phase(plan_id: int, data: schemas.PhaseCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        phase = service.create_phase(plan_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return schemas.PhaseRead.model_validate(phase)


@router.get("/{plan_id}/phases", response_model=list[schemas.PhaseRead])
def list_phases(plan_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        plan = service.get_plan(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return [schemas.PhaseRead.model_validate(phase) for phase in plan.phases]


@router.post("/{plan_id}/coas", response_model=schemas.COARead)
def create_coa(plan_id: int, data: schemas.COACreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        coa = service.create_coa(plan_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return schemas.COARead.model_validate(coa)


@router.get("/{plan_id}/coas", response_model=list[schemas.COARead])
def list_coas(plan_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        plan = service.get_plan(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return [schemas.COARead.model_validate(coa) for coa in plan.coas]


@router.post("/{plan_id}/areas")
def create_area(plan_id: int, data: schemas.AreaCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        area = service.create_area(plan_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return area


@router.post("/{plan_id}/tasks", response_model=schemas.TaskRead)
def create_task(plan_id: int, data: schemas.TaskCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        task = service.create_task(plan_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return schemas.TaskRead.model_validate(task)


@router.get("/{plan_id}/tasks", response_model=list[schemas.TaskRead])
def list_tasks(plan_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        service.get_plan(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return [schemas.TaskRead.model_validate(task) for task in service.list_tasks(plan_id)]


@router.post("/{plan_id}/ttl", response_model=schemas.TTLRead)
def create_ttl(plan_id: int, data: schemas.TTLCreate, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        ttl = service.create_ttl(plan_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return schemas.TTLRead.model_validate(ttl)


@router.get("/{plan_id}/ttl", response_model=list[schemas.TTLRead])
def list_ttl(plan_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        service.get_plan(plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    ttl_items = service.list_ttl_for_plan(plan_id)
    return [schemas.TTLRead.model_validate(ttl) for ttl in ttl_items]


@router.get("/ttl/{ttl_id}", response_model=schemas.TTLRead)
def get_ttl(ttl_id: int, session: Session = Depends(get_session)):
    service = _service(session)
    try:
        ttl = service.get_ttl(ttl_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return schemas.TTLRead.model_validate(ttl)
