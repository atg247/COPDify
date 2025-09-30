from __future__ import annotations

import json
from typing import Dict

from sqlmodel import Session

from app.server.db.models import TTRResult, TTL
from app.server.domain import schemas


class TTRService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def apply_rule(self, payload: schemas.TTRApplyRequest) -> schemas.TTRApplyResponse:
        ttl = self.session.get(TTL, payload.ttl_id)
        if not ttl:
            raise ValueError(f"TTL {payload.ttl_id} not found")

        task = ttl.task
        context = {
            "task": {
                "id": task.id,
                "name": task.name,
                "force_orientation": task.force_orientation,
                "service": task.service,
            },
            "ttl": {
                "id": ttl.id,
                "relative_to": ttl.relative_to,
                "start_offset_hours": ttl.start_offset_hours,
                "end_offset_hours": ttl.end_offset_hours,
                "phase_id": ttl.phase_id,
                "area_id": ttl.area_id,
                "coa_id": ttl.coa_id,
            },
        }
        context.update(payload.context_overrides)

        duration = None
        if ttl.start_offset_hours is not None and ttl.end_offset_hours is not None:
            duration = max(ttl.end_offset_hours - ttl.start_offset_hours, 0)

        package = {
            "recommended_unit": task.force_orientation or "Unknown",
            "estimated_duration_hours": duration,
            "priority": task.priority,
            "service": task.service,
        }

        trace_lines = [
            f"TTL {ttl.id} analysed for task '{task.name}'",
            f"Force orientation: {task.force_orientation or 'unspecified'}",
        ]
        if duration is not None:
            trace_lines.append(f"Duration window: {duration} hours")
        if payload.context_overrides:
            trace_lines.append(f"Context overrides: {json.dumps(payload.context_overrides)}")

        result = TTRResult(
            ttl_id=ttl.id,
            rule_id=0,
            recommended_force_package=json.dumps(package),
            sensitivity_notes="Contextual heuristic output",
        )
        self.session.add(result)
        self.session.commit()
        self.session.refresh(result)

        return schemas.TTRApplyResponse(ttl_id=ttl.id, package=package, trace=trace_lines)


__all__ = ["TTRService"]
