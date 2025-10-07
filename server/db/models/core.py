from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class Plan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    scope: Optional[str] = None
    theater: Optional[str] = None
    reference_m_day: Optional[datetime] = None
    reference_c_day: Optional[datetime] = None
    reference_d_day: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    phases: List["Phase"] = Relationship(back_populates="plan")
    coas: List["COA"] = Relationship(back_populates="plan")
    tasks: List["Task"] = Relationship(back_populates="plan")
    ttl_items: List["TTL"] = Relationship(back_populates="plan")
    decisions: List["Decision"] = Relationship(back_populates="plan")
    factors: List["Factor"] = Relationship(back_populates="plan")
    risks: List["Risk"] = Relationship(back_populates="plan")
    assumptions: List["Assumption"] = Relationship(back_populates="plan")
    constraints: List["Constraint"] = Relationship(back_populates="plan")
    decisive_conditions: List["DecisiveCondition"] = Relationship(back_populates="plan")
    decision_points: List["DecisionPoint"] = Relationship(back_populates="plan")
    ccirs: List["CCIR"] = Relationship(back_populates="plan")
    sync_rows: List["SyncRow"] = Relationship(back_populates="plan")
    info_requirements: List["InfoRequirement"] = Relationship(back_populates="plan")
    cog_items: List["COGItem"] = Relationship(back_populates="plan")


class Phase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    name: str
    sequence: int = Field(default=1, ge=1)
    objectives: Optional[str] = None
    decisive_conditions: Optional[str] = None
    start_offset_days: Optional[int] = None
    end_offset_days: Optional[int] = None

    plan: Plan = Relationship(back_populates="phases")
    tasks: List["Task"] = Relationship(back_populates="phase")
    ttl_items: List["TTL"] = Relationship(back_populates="phase")
    risks: List["Risk"] = Relationship(back_populates="phase")
    decisive_condition_items: List["DecisiveCondition"] = Relationship(back_populates="phase")
    decision_points: List["DecisionPoint"] = Relationship(back_populates="phase")
    sync_rows: List["SyncRow"] = Relationship(back_populates="phase")


class COA(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    name: str
    description: Optional[str] = None
    assumptions: Optional[str] = None
    risks: Optional[str] = None
    measures_of_effectiveness: Optional[str] = None
    measures_of_performance: Optional[str] = None
    wargame_notes: Optional[str] = None

    plan: Plan = Relationship(back_populates="coas")
    ttl_items: List["TTL"] = Relationship(back_populates="coa")
    decision_points: List["DecisionPoint"] = Relationship(back_populates="coa")


class Area(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    name: str
    area_type: str = Field(default="AO")
    geojson: str

    ttl_items: List["TTL"] = Relationship(back_populates="area")
    decision_points: List["DecisionPoint"] = Relationship(back_populates="location_area")


class TaskCategory(str, Enum):
    ASSIGNED = "assigned"
    IMPLIED = "implied"
    ESSENTIAL = "essential"


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    phase_id: Optional[int] = Field(default=None, foreign_key="phase.id")
    parent_id: Optional[int] = Field(default=None, foreign_key="task.id")
    name: str
    description: Optional[str] = None
    category: TaskCategory = Field(default=TaskCategory.ASSIGNED)
    force_orientation: Optional[str] = None
    service: Optional[str] = None
    priority: Optional[int] = None

    plan: Plan = Relationship(back_populates="tasks")
    phase: Optional[Phase] = Relationship(back_populates="tasks")
    parent: Optional["Task"] = Relationship(back_populates="children", sa_relationship_kwargs={"remote_side": "Task.id"})
    children: List["Task"] = Relationship(back_populates="parent")
    ttl_items: List["TTL"] = Relationship(back_populates="task")


class TTLStatus(str, Enum):
    PLANNED = "planned"
    APPROVED = "approved"
    COMPLETED = "completed"


class TTL(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    task_id: int = Field(foreign_key="task.id")
    phase_id: Optional[int] = Field(default=None, foreign_key="phase.id")
    coa_id: Optional[int] = Field(default=None, foreign_key="coa.id")
    area_id: Optional[int] = Field(default=None, foreign_key="area.id")
    start_offset_hours: Optional[int] = None
    end_offset_hours: Optional[int] = None
    relative_to: Optional[str] = Field(default="D-Day")
    status: TTLStatus = Field(default=TTLStatus.PLANNED)

    plan: "Plan" = Relationship(back_populates="ttl_items")
    task: Task = Relationship(back_populates="ttl_items")
    phase: Optional[Phase] = Relationship(back_populates="ttl_items")
    area: Optional[Area] = Relationship(back_populates="ttl_items")
    coa: Optional[COA] = Relationship(back_populates="ttl_items")
    ttr_results: List["TTRResult"] = Relationship(back_populates="ttl")


class FactorDomain(str, Enum):
    POL = "POL"
    MIL = "MIL"
    ECO = "ECO"
    SOC = "SOC"
    INF = "INF"
    INFRA = "INFRA"
    NATENV = "NATENV"
    LEGAL = "LEGAL"
    OTHER = "OTHER"


class Factor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    phase_id: Optional[int] = Field(default=None, foreign_key="phase.id")
    coa_id: Optional[int] = Field(default=None, foreign_key="coa.id")
    title: str
    description: Optional[str] = None
    domain: FactorDomain = Field(default=FactorDomain.OTHER)
    source_ref: Optional[str] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    plan: Plan = Relationship(back_populates="factors")
    phase: Optional["Phase"] = Relationship()
    coa: Optional["COA"] = Relationship()
    deductions: List["FactorDeduction"] = Relationship(back_populates="factor")
    conclusions: List["FactorConclusion"] = Relationship(back_populates="factor")


class FactorDeduction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    factor_id: int = Field(foreign_key="factor.id")
    text: str
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    factor: Factor = Relationship(back_populates="deductions")
    conclusions: List["FactorConclusion"] = Relationship(back_populates="deduction")


class ConclusionType(str, Enum):
    TASK = "TASK"
    CONSTRAINT = "CONSTRAINT"
    RISK = "RISK"
    ASSUMPTION = "ASSUMPTION"
    DC = "DC"
    DP = "DP"
    COG = "COG"
    CCIR = "CCIR"
    SYNC = "SYNC"
    INFO = "INFO"


class ConclusionStatus(str, Enum):
    DRAFT = "DRAFT"
    REVIEWED = "REVIEWED"
    APPROVED = "APPROVED"


class FactorConclusion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    factor_id: int = Field(foreign_key="factor.id")
    deduction_id: int = Field(foreign_key="factordeduction.id")
    type: ConclusionType
    text: str
    priority: Optional[int] = None
    status: ConclusionStatus = Field(default=ConclusionStatus.DRAFT)
    owner: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    factor: Factor = Relationship(back_populates="conclusions")
    deduction: FactorDeduction = Relationship(back_populates="conclusions")
    links: List["ConclusionLink"] = Relationship(back_populates="conclusion")


class ConclusionTarget(str, Enum):
    TASK = "task"
    CONSTRAINT = "constraint"
    RISK = "risk"
    ASSUMPTION = "assumption"
    DECISIVE_CONDITION = "decisive_condition"
    DECISION_POINT = "decision_point"
    COG_ITEM = "cog_item"
    CCIR = "ccir"
    SYNC = "sync"
    INFO_REQ = "info_req"


class ConclusionLink(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conclusion_id: int = Field(foreign_key="factorconclusion.id")
    target_kind: ConclusionTarget
    target_id: Optional[int] = None

    conclusion: FactorConclusion = Relationship(back_populates="links")


class Risk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    phase_id: Optional[int] = Field(default=None, foreign_key="phase.id")
    title: str
    severity: Optional[str] = None
    probability: Optional[str] = None
    mitigation: Optional[str] = None
    owner: Optional[str] = None
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="risks")
    phase: Optional[Phase] = Relationship(back_populates="risks")


class Assumption(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    text: str
    to_be_validated_by: Optional[str] = None
    validity_window: Optional[str] = None
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="assumptions")


class Constraint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    text: str
    source: Optional[str] = None
    scope: Optional[str] = None
    enforced_in_validator: bool = Field(default=False)
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="constraints")


class DecisiveCondition(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    phase_id: Optional[int] = Field(default=None, foreign_key="phase.id")
    name: str
    description: Optional[str] = None
    success_criteria: Optional[str] = None
    moe: Optional[str] = Field(default=None, description="Measure of Effectiveness")
    mop: Optional[str] = Field(default=None, description="Measure of Performance")
    related_effects: Optional[str] = None
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="decisive_conditions")
    phase: Optional[Phase] = Relationship(back_populates="decisive_condition_items")


class DecisionPoint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    phase_id: Optional[int] = Field(default=None, foreign_key="phase.id")
    coa_id: Optional[int] = Field(default=None, foreign_key="coa.id")
    name: str
    description: Optional[str] = None
    trigger_time: Optional[str] = Field(default=None, description="Time-based trigger (e.g., D+3)")
    trigger_event: Optional[str] = Field(default=None, description="Event-based trigger")
    trigger_geo: Optional[str] = Field(default=None, description="Geospatial expression")
    location_area_id: Optional[int] = Field(default=None, foreign_key="area.id")
    branches_sequels: Optional[str] = Field(default=None, description="JSON array of branch/sequel options")
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="decision_points")
    phase: Optional[Phase] = Relationship(back_populates="decision_points")
    coa: Optional[COA] = Relationship(back_populates="decision_points")
    location_area: Optional[Area] = Relationship(back_populates="decision_points")


class CCIRKind(str, Enum):
    PIR = "PIR"
    EEFI = "EEFI"
    FFIR = "FFIR"


class CCIR(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    kind: CCIRKind = Field(default=CCIRKind.PIR)
    text: str
    linked_rfi_id: Optional[int] = None
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="ccirs")


class SyncRow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    phase_id: Optional[int] = Field(default=None, foreign_key="phase.id")
    lane: Optional[str] = None
    text: str
    link_ref: Optional[str] = None
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="sync_rows")
    phase: Optional[Phase] = Relationship(back_populates="sync_rows")


class InfoRequirement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    name: str
    description: Optional[str] = None
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="info_requirements")


class COGType(str, Enum):
    CRITICAL_CAPABILITY = "critical_capability"
    CRITICAL_REQUIREMENT = "critical_requirement"
    CRITICAL_VULNERABILITY = "critical_vulnerability"


class COGItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    actor_name: str = Field(description="Friendly/Enemy/Neutral actor")
    cog_type: COGType
    description: str
    analysis_notes: Optional[str] = None
    derived_from: Optional[str] = None

    plan: Plan = Relationship(back_populates="cog_items")


class TTRRule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    rule_script: str = Field(description="Serialized rule definition")

    results: List["TTRResult"] = Relationship(back_populates="rule")


class TTRResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ttl_id: int = Field(foreign_key="ttl.id")
    rule_id: Optional[int] = Field(default=None, foreign_key="ttrrule.id")
    recommended_force_package: str
    sensitivity_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    ttl: TTL = Relationship(back_populates="ttr_results")
    rule: TTRRule = Relationship(back_populates="results")


class UnitGeneric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: Optional[str] = None
    ric_code: Optional[str] = None
    description: Optional[str] = None
    factors_of_merit: Optional[str] = None


class UnitReal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    parent_service: Optional[str] = None
    echelon: Optional[str] = None
    home_station: Optional[str] = None
    generic_unit_id: Optional[int] = Field(default=None, foreign_key="unitgeneric.id")

    generic_unit: Optional[UnitGeneric] = Relationship()


class Decision(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    entity_ref: Optional[str] = None
    decision_text: str
    assumptions: Optional[str] = None
    constraints: Optional[str] = None
    sync_notes: Optional[str] = None
    author: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    plan: Plan = Relationship(back_populates="decisions")


class ProductCONOPS(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="plan.id")
    coa_id: Optional[int] = Field(default=None, foreign_key="coa.id")
    generated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    summary: Optional[str] = None
    content: str

    plan: Plan = Relationship()
    coa: Optional[COA] = Relationship()


class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: Optional[int] = Field(default=None, foreign_key="plan.id")
    action: str
    actor: Optional[str] = None
    payload: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    plan: Optional[Plan] = Relationship()
