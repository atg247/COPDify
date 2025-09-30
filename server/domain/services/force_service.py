from __future__ import annotations

from typing import List

from sqlmodel import Session, select

from app.server.db.models import UnitGeneric, UnitReal


class ForceService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_generic_units(self) -> List[UnitGeneric]:
        return list(self.session.exec(select(UnitGeneric)).all())

    def create_generic_unit(self, payload: dict) -> UnitGeneric:
        unit = UnitGeneric(**payload)
        self.session.add(unit)
        self.session.commit()
        self.session.refresh(unit)
        return unit

    def list_real_units(self) -> List[UnitReal]:
        statement = select(UnitReal)
        return list(self.session.exec(statement).all())

    def create_real_unit(self, payload: dict) -> UnitReal:
        unit = UnitReal(**payload)
        self.session.add(unit)
        self.session.commit()
        self.session.refresh(unit)
        return unit


__all__ = ["ForceService"]
