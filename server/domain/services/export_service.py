from __future__ import annotations

from datetime import datetime
from typing import List

from sqlmodel import Session, select

from app.server.db.models import COA, Plan, ProductCONOPS, TTL
from app.server.domain import schemas


class ExportService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def generate_conops(self, payload: schemas.ConopsExportRequest) -> schemas.ConopsExportResponse:
        plan = self.session.get(Plan, payload.plan_id)
        if not plan:
            raise ValueError(f"Plan {payload.plan_id} not found")

        coa: COA | None = None
        if payload.coa_id:
            coa = self.session.get(COA, payload.coa_id)
            if not coa or coa.plan_id != plan.id:
                raise ValueError("COA not found for plan")

        ttl_items = self.session.exec(
            select(TTL).where(TTL.plan_id == plan.id)
        ).all()

        content = self._build_markdown(plan=plan, coa=coa, ttl_items=ttl_items)
        product = ProductCONOPS(plan_id=plan.id, coa_id=coa.id if coa else None, summary=content[:200], content=content)
        self.session.add(product)
        self.session.commit()
        self.session.refresh(product)

        filename = f"CONOPS_plan_{plan.id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.md"
        return schemas.ConopsExportResponse(product_id=product.id, filename=filename, content=content)

    def _build_markdown(self, plan: Plan, coa: COA | None, ttl_items: List[TTL]) -> str:
        header = ["# CONOPS", f"## Plan: {plan.name}"]
        if plan.scope:
            header.append(f"- Scope: {plan.scope}")
        if plan.theater:
            header.append(f"- Theater: {plan.theater}")
        if coa:
            header.append(f"- Selected COA: {coa.name}")

        phases_section = ["## Phases"]
        for phase in sorted(plan.phases, key=lambda p: p.sequence):
            phases_section.append(f"- Phase {phase.sequence}: {phase.name} :: {phase.objectives or 'Objectives TBD'}")

        ttl_lines = ["## TTL Overview"]
        for ttl in ttl_items:
            ttl_lines.append(
                f"- Task {ttl.task_id} in phase {ttl.phase_id or '-'} at area {ttl.area_id or '-'} :: {ttl.relative_to} +{ttl.start_offset_hours}h"
            )

        decision_lines = ["## Key Decisions"]
        for decision in plan.decisions:
            decision_lines.append(f"- {decision.decision_text} (by {decision.author or 'unknown'})")

        parts = header + [""] + phases_section + [""] + ttl_lines + [""] + decision_lines
        return "\n".join(parts)


__all__ = ["ExportService"]
