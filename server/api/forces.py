from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from server.db.base import get_session
from server.domain.services.force_service import ForceService

router = APIRouter(prefix="/forces", tags=["Forces"])

# Placeholder RIC library for demo purposes
_SAMPLE_RIC_LIBRARY = {
    "INF-BN": {"name": "Infantry Battalion", "personnel": 720, "vehicles": 120},
    "ARM-CO": {"name": "Armored Company", "personnel": 160, "vehicles": 60},
}


def _service(session: Session) -> ForceService:
    return ForceService(session)


@router.get("/units/generic")
def list_generic_units(session: Session = Depends(get_session)):
    return _service(session).list_generic_units()


@router.post("/units/generic")
def create_generic_unit(payload: dict, session: Session = Depends(get_session)):
    return _service(session).create_generic_unit(payload)


@router.get("/units/real")
def list_real_units(session: Session = Depends(get_session)):
    return _service(session).list_real_units()


@router.post("/units/real")
def create_real_unit(payload: dict, session: Session = Depends(get_session)):
    return _service(session).create_real_unit(payload)


@router.get("/equipment/ric/{code}")
def get_equipment_ric(code: str):
    info = _SAMPLE_RIC_LIBRARY.get(code.upper())
    if not info:
        raise HTTPException(status_code=404, detail="RIC code not found")
    return info
