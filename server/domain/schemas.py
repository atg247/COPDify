from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    scope: Optional[str] = None
    theater: Optional[str] = None
    reference_m_day: Optional[datetime] = None
    reference_c_day: Optional[datetime] = None
    reference_d_day: Optional[datetime] = None


class PlanRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    scope: Optional[str]
    theater: Optional[str]
    reference_m_day: Optional[datetime]
    reference_c_day: Optional[datetime]
    reference_d_day: Optional[datetime]

    class Config:
        from_attributes = True


class PhaseCreate(BaseModel):
    name: str
    sequence: int = 1
    objectives: Optional[str] = None
    decisive_conditions: Optional[str] = None
    start_offset_days: Optional[int] = None
    end_offset_days: Optional[int] = None


class PhaseRead(BaseModel):
    id: int
    name: str
    sequence: int
    objectives: Optional[str]
    decisive_conditions: Optional[str]

    class Config:
        from_attributes = True


class COACreate(BaseModel):
    name: str
    description: Optional[str] = None
    assumptions: Optional[str] = None
    risks: Optional[str] = None
    measures_of_effectiveness: Optional[str] = None
    measures_of_performance: Optional[str] = None
    wargame_notes: Optional[str] = None


class COARead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    assumptions: Optional[str]

    class Config:
        from_attributes = True


class AreaCreate(BaseModel):
    name: str
    area_type: str = "AO"
    geojson: str


class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "assigned"
    force_orientation: Optional[str] = None
    service: Optional[str] = None
    priority: Optional[int] = None
    phase_id: Optional[int] = None
    parent_id: Optional[int] = None


class TaskRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    phase_id: Optional[int]

    class Config:
        from_attributes = True


class TTLCreate(BaseModel):
    task_id: int
    phase_id: Optional[int]
    coa_id: Optional[int]
    area_id: Optional[int]
    start_offset_hours: Optional[int]
    end_offset_hours: Optional[int]
    relative_to: Optional[str] = "D-Day"


class TTLRead(BaseModel):
    id: int
    task_id: int
    phase_id: Optional[int]
    coa_id: Optional[int]
    area_id: Optional[int]
    start_offset_hours: Optional[int]
    end_offset_hours: Optional[int]
    relative_to: Optional[str]
    status: str

    class Config:
        from_attributes = True


class FactorCreate(BaseModel):
    plan_id: int
    title: str
    description: Optional[str] = None
    domain: str = "OTHER"
    source_ref: Optional[str] = None
    confidence: Optional[float] = None
    created_by: Optional[str] = None


class FactorRead(BaseModel):
    id: int
    plan_id: int
    title: str
    description: Optional[str]
    domain: str

    class Config:
        from_attributes = True


class FactorDeductionCreate(BaseModel):
    text: str
    confidence: Optional[float] = None


class FactorConclusionCreate(BaseModel):
    deduction_id: int
    type: str
    text: str
    priority: Optional[int] = None
    owner: Optional[str] = None


class ConclusionStatusUpdate(BaseModel):
    status: str


class ConclusionLinkCreate(BaseModel):
    target_kind: str
    target_id: Optional[int] = None
    create_payload: Optional[dict] = None


class RiskCreate(BaseModel):
    title: str
    severity: Optional[str] = None
    probability: Optional[str] = None
    mitigation: Optional[str] = None
    owner: Optional[str] = None
    phase_id: Optional[int] = None


class AssumptionCreate(BaseModel):
    text: str
    to_be_validated_by: Optional[str] = None
    validity_window: Optional[str] = None


class ConstraintCreate(BaseModel):
    text: str
    source: Optional[str] = None
    scope: Optional[str] = None
    enforced_in_validator: bool = False


class DecisiveConditionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    success_criteria: Optional[str] = None
    moe: Optional[str] = None
    mop: Optional[str] = None
    related_effects: Optional[str] = None
    phase_id: Optional[int] = None


class DecisionPointCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_time: Optional[str] = None
    trigger_event: Optional[str] = None
    trigger_geo: Optional[str] = None
    location_area_id: Optional[int] = None
    branches_sequels: Optional[str] = None
    phase_id: Optional[int] = None
    coa_id: Optional[int] = None


class CCIRCreate(BaseModel):
    kind: str = "PIR"
    text: str
    linked_rfi_id: Optional[int] = None


class SyncRowCreate(BaseModel):
    phase_id: Optional[int] = None
    lane: Optional[str] = None
    text: str
    link_ref: Optional[str] = None


class InfoRequirementCreate(BaseModel):
    name: str
    description: Optional[str] = None


class COGItemCreate(BaseModel):
    actor_name: str
    cog_type: str
    description: str
    analysis_notes: Optional[str] = None


class DecisionCreate(BaseModel):
    plan_id: int
    entity_ref: Optional[str] = None
    decision_text: str
    assumptions: Optional[str] = None
    constraints: Optional[str] = None
    sync_notes: Optional[str] = None
    author: Optional[str] = None


class DecisionRead(BaseModel):
    id: int
    plan_id: int
    entity_ref: Optional[str]
    decision_text: str
    author: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TTRApplyRequest(BaseModel):
    ttl_id: int
    context_overrides: dict = Field(default_factory=dict)


class TTRApplyResponse(BaseModel):
    ttl_id: int
    package: dict
    trace: List[str]


class ConopsExportRequest(BaseModel):
    plan_id: int
    coa_id: Optional[int] = None
    format: str = "markdown"


class ConopsExportResponse(BaseModel):
    product_id: int
    filename: str
    content: str


class TraceResponse(BaseModel):
    conclusion_id: int
    factor: dict
    deduction: dict
    linked_entities: List[dict]


class RiskRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    likelihood: Optional[int] = None
    impact: Optional[int] = None

    class Config:
        from_attributes = True


class DecisiveConditionRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    success_criteria: Optional[str] = None
    moe: Optional[str] = None
    mop: Optional[str] = None

    class Config:
        from_attributes = True


class DecisionPointRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    trigger_time: Optional[str] = None
    trigger_event: Optional[str] = None

    class Config:
        from_attributes = True


class ConstraintRead(BaseModel):
    id: int
    text: str

    class Config:
        from_attributes = True


class AssumptionRead(BaseModel):
    id: int
    text: str
    validated: Optional[bool] = None

    class Config:
        from_attributes = True


class CCIRRead(BaseModel):
    id: int
    kind: str
    text: str

    class Config:
        from_attributes = True
