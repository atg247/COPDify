from __future__ import annotations

import json
from typing import Dict, List, Optional, Type

from sqlmodel import Session, select

from server.db.models import (
    Assumption,
    CCIR,
    CCIRKind,
    COGItem,
    COGType,
    ConclusionLink,
    ConclusionStatus,
    ConclusionTarget,
    ConclusionType,
    Constraint,
    DecisiveCondition,
    DecisionPoint,
    Factor,
    FactorConclusion,
    FactorDeduction,
    FactorDomain,
    InfoRequirement,
    Risk,
    SyncRow,
    Task,
    TaskCategory,
)
from server.domain import schemas


class FactorService:
    TARGET_MODEL_MAP: Dict[ConclusionTarget, Type] = {
        ConclusionTarget.TASK: Task,
        ConclusionTarget.CONSTRAINT: Constraint,
        ConclusionTarget.RISK: Risk,
        ConclusionTarget.ASSUMPTION: Assumption,
        ConclusionTarget.DECISIVE_CONDITION: DecisiveCondition,
        ConclusionTarget.DECISION_POINT: DecisionPoint,
        ConclusionTarget.COG_ITEM: COGItem,
        ConclusionTarget.CCIR: CCIR,
        ConclusionTarget.SYNC: SyncRow,
        ConclusionTarget.INFO_REQ: InfoRequirement,
    }

    def __init__(self, session: Session) -> None:
        self.session = session

    # Factor lifecycle -------------------------------------------------
    def create_factor(self, data: schemas.FactorCreate) -> Factor:
        factor = Factor(
            plan_id=data.plan_id,
            title=data.title,
            description=data.description,
            domain=self._parse_domain(data.domain),
            source_ref=data.source_ref,
            confidence=data.confidence,
            created_by=data.created_by,
        )
        self.session.add(factor)
        self.session.commit()
        self.session.refresh(factor)
        return factor

    def list_factors(self, plan_id: Optional[int] = None) -> List[Factor]:
        statement = select(Factor)
        if plan_id:
            statement = statement.where(Factor.plan_id == plan_id)
        return list(self.session.exec(statement).all())

    def delete_factor(self, factor_id: int) -> None:
        """Delete a factor and all its deductions and conclusions"""
        factor = self._get_factor(factor_id)

        # Delete all conclusions for this factor
        conclusion_stmt = select(FactorConclusion).where(FactorConclusion.factor_id == factor_id)
        conclusions = self.session.exec(conclusion_stmt).all()
        for conclusion in conclusions:
            # Delete links first
            link_stmt = select(ConclusionLink).where(ConclusionLink.conclusion_id == conclusion.id)
            links = self.session.exec(link_stmt).all()
            for link in links:
                self.session.delete(link)
            self.session.delete(conclusion)

        # Delete all deductions
        deduction_stmt = select(FactorDeduction).where(FactorDeduction.factor_id == factor_id)
        deductions = self.session.exec(deduction_stmt).all()
        for deduction in deductions:
            self.session.delete(deduction)

        # Delete the factor itself
        self.session.delete(factor)
        self.session.commit()

    # Deduction --------------------------------------------------------
    def add_deduction(self, factor_id: int, data: schemas.FactorDeductionCreate) -> FactorDeduction:
        factor = self._get_factor(factor_id)
        deduction = FactorDeduction(
            factor_id=factor.id,
            text=data.text,
            confidence=data.confidence,
        )
        self.session.add(deduction)
        self.session.commit()
        self.session.refresh(deduction)
        return deduction

    def delete_deduction(self, deduction_id: int) -> None:
        """Delete a deduction and all its conclusions"""
        deduction = self.session.get(FactorDeduction, deduction_id)
        if not deduction:
            raise ValueError(f"Deduction {deduction_id} not found")

        # Delete all conclusions for this deduction
        conclusion_stmt = select(FactorConclusion).where(FactorConclusion.deduction_id == deduction_id)
        conclusions = self.session.exec(conclusion_stmt).all()
        for conclusion in conclusions:
            # Delete links first
            link_stmt = select(ConclusionLink).where(ConclusionLink.conclusion_id == conclusion.id)
            links = self.session.exec(link_stmt).all()
            for link in links:
                self.session.delete(link)
            self.session.delete(conclusion)

        # Delete the deduction itself
        self.session.delete(deduction)
        self.session.commit()

    # Conclusion -------------------------------------------------------
    def add_conclusion(self, factor_id: int, data: schemas.FactorConclusionCreate) -> FactorConclusion:
        factor = self._get_factor(factor_id)
        deduction = self.session.get(FactorDeduction, data.deduction_id)
        if not deduction or deduction.factor_id != factor.id:
            raise ValueError("Deduction does not belong to factor")

        conclusion = FactorConclusion(
            factor_id=factor.id,
            deduction_id=deduction.id,
            type=self._parse_conclusion_type(data.type),
            text=data.text,
            priority=data.priority,
            owner=data.owner,
        )
        self.session.add(conclusion)
        self.session.commit()
        self.session.refresh(conclusion)
        return conclusion

    def update_conclusion_status(self, conclusion_id: int, data: schemas.ConclusionStatusUpdate) -> FactorConclusion:
        conclusion = self._get_conclusion(conclusion_id)
        new_status = self._parse_conclusion_status(data.status)
        if new_status == ConclusionStatus.APPROVED and not conclusion.links:
            raise ValueError("Cannot approve a conclusion without at least one link")
        conclusion.status = new_status
        self.session.add(conclusion)
        self.session.commit()
        self.session.refresh(conclusion)
        return conclusion

    def delete_conclusion(self, conclusion_id: int) -> None:
        """Delete a conclusion and all its links"""
        conclusion = self._get_conclusion(conclusion_id)

        # Delete all links
        link_stmt = select(ConclusionLink).where(ConclusionLink.conclusion_id == conclusion_id)
        links = self.session.exec(link_stmt).all()
        for link in links:
            self.session.delete(link)

        # Delete the conclusion itself
        self.session.delete(conclusion)
        self.session.commit()

    def link_conclusion(self, conclusion_id: int, link_data: schemas.ConclusionLinkCreate) -> ConclusionLink:
        conclusion = self._get_conclusion(conclusion_id)
        target_kind = self._parse_target(link_data.target_kind)

        target_id = link_data.target_id
        if not target_id and link_data.create_payload:
            target_id = self._create_target_entity(conclusion, target_kind, link_data.create_payload)

        if not target_id:
            raise ValueError("target_id or create_payload required")

        link = ConclusionLink(conclusion_id=conclusion.id, target_kind=target_kind, target_id=target_id)
        self.session.add(link)
        self.session.commit()
        self.session.refresh(link)
        return link

    # Internal helpers -------------------------------------------------
    def _get_factor(self, factor_id: int) -> Factor:
        factor = self.session.get(Factor, factor_id)
        if not factor:
            raise ValueError(f"Factor {factor_id} not found")
        return factor

    def _get_conclusion(self, conclusion_id: int) -> FactorConclusion:
        conclusion = self.session.get(FactorConclusion, conclusion_id)
        if not conclusion:
            raise ValueError(f"Conclusion {conclusion_id} not found")
        return conclusion

    def _parse_domain(self, domain: str) -> FactorDomain:
        try:
            return FactorDomain(domain.upper())
        except ValueError as exc:
            raise ValueError(f"Unknown factor domain {domain}") from exc

    def _parse_conclusion_type(self, conclusion_type: str) -> ConclusionType:
        try:
            return ConclusionType(conclusion_type.upper())
        except ValueError as exc:
            raise ValueError(f"Unknown conclusion type {conclusion_type}") from exc

    def _parse_conclusion_status(self, status: str) -> ConclusionStatus:
        try:
            return ConclusionStatus(status.upper())
        except ValueError as exc:
            raise ValueError(f"Unknown conclusion status {status}") from exc

    def _parse_target(self, target: str) -> ConclusionTarget:
        try:
            return ConclusionTarget(target.lower())
        except ValueError as exc:
            raise ValueError(f"Unknown conclusion target {target}") from exc

    def _create_target_entity(self, conclusion: FactorConclusion, target_kind: ConclusionTarget, payload: Dict) -> int:
        plan_id = conclusion.factor.plan_id
        derived_from = json.dumps([conclusion.id])

        if target_kind == ConclusionTarget.TASK:
            data = schemas.TaskCreate(**payload)
            task_payload = data.model_dump()
            category_value = task_payload.pop("category", "assigned").lower()
            task = Task(plan_id=plan_id, category=TaskCategory(category_value), **task_payload)
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)
            return task.id

        if target_kind == ConclusionTarget.CONSTRAINT:
            data = schemas.ConstraintCreate(**payload)
            constraint = Constraint(plan_id=plan_id, derived_from=derived_from, **data.model_dump())
            self.session.add(constraint)
            self.session.commit()
            self.session.refresh(constraint)
            return constraint.id

        if target_kind == ConclusionTarget.RISK:
            data = schemas.RiskCreate(**payload)
            risk = Risk(plan_id=plan_id, derived_from=derived_from, **data.model_dump())
            self.session.add(risk)
            self.session.commit()
            self.session.refresh(risk)
            return risk.id

        if target_kind == ConclusionTarget.ASSUMPTION:
            data = schemas.AssumptionCreate(**payload)
            assumption = Assumption(plan_id=plan_id, derived_from=derived_from, **data.model_dump())
            self.session.add(assumption)
            self.session.commit()
            self.session.refresh(assumption)
            return assumption.id

        if target_kind == ConclusionTarget.DECISIVE_CONDITION:
            data = schemas.DecisiveConditionCreate(**payload)
            dc = DecisiveCondition(plan_id=plan_id, derived_from=derived_from, **data.model_dump())
            self.session.add(dc)
            self.session.commit()
            self.session.refresh(dc)
            return dc.id

        if target_kind == ConclusionTarget.DECISION_POINT:
            data = schemas.DecisionPointCreate(**payload)
            dp = DecisionPoint(plan_id=plan_id, derived_from=derived_from, **data.model_dump())
            self.session.add(dp)
            self.session.commit()
            self.session.refresh(dp)
            return dp.id

        if target_kind == ConclusionTarget.CCIR:
            data = schemas.CCIRCreate(**payload)
            ccir = CCIR(
                plan_id=plan_id,
                derived_from=derived_from,
                kind=CCIRKind(data.kind.upper()),
                text=data.text,
                linked_rfi_id=data.linked_rfi_id,
            )
            self.session.add(ccir)
            self.session.commit()
            self.session.refresh(ccir)
            return ccir.id

        if target_kind == ConclusionTarget.SYNC:
            data = schemas.SyncRowCreate(**payload)
            sync_row = SyncRow(plan_id=plan_id, derived_from=derived_from, **data.model_dump())
            self.session.add(sync_row)
            self.session.commit()
            self.session.refresh(sync_row)
            return sync_row.id

        if target_kind == ConclusionTarget.INFO_REQ:
            data = schemas.InfoRequirementCreate(**payload)
            info = InfoRequirement(plan_id=plan_id, derived_from=derived_from, **data.model_dump())
            self.session.add(info)
            self.session.commit()
            self.session.refresh(info)
            return info.id

        if target_kind == ConclusionTarget.COG_ITEM:
            data = schemas.COGItemCreate(**payload)
            cog = COGItem(
                plan_id=plan_id,
                derived_from=derived_from,
                actor_name=data.actor_name,
                cog_type=COGType(data.cog_type),
                description=data.description,
                analysis_notes=data.analysis_notes,
            )
            self.session.add(cog)
            self.session.commit()
            self.session.refresh(cog)
            return cog.id

        raise ValueError(f"Cannot auto-create target {target_kind.value}")

    def _get_target(self, target_kind: ConclusionTarget, target_id: int):
        model = self.TARGET_MODEL_MAP.get(target_kind)
        if not model:
            return None
        return self.session.get(model, target_id)

    def _summarize_target(self, target_kind: ConclusionTarget, obj) -> str:
        if target_kind == ConclusionTarget.TASK:
            return getattr(obj, "name", str(obj.id))
        if target_kind == ConclusionTarget.CONSTRAINT:
            return obj.text
        if target_kind == ConclusionTarget.RISK:
            return obj.title
        if target_kind == ConclusionTarget.ASSUMPTION:
            return obj.text
        if target_kind == ConclusionTarget.DECISIVE_CONDITION:
            return obj.name
        if target_kind == ConclusionTarget.DECISION_POINT:
            return obj.name
        if target_kind == ConclusionTarget.CCIR:
            return obj.text
        if target_kind == ConclusionTarget.SYNC:
            return obj.text
        if target_kind == ConclusionTarget.INFO_REQ:
            return obj.name
        if target_kind == ConclusionTarget.COG_ITEM:
            return f"{obj.actor_name}: {obj.cog_type.value} - {obj.description[:50]}"
        return str(obj)


__all__ = ["FactorService"]
