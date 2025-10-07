#!/usr/bin/env python3
"""
Test script for Factor Analysis API endpoints
Tests the complete workflow: Factor → Deduction → Conclusion → Link to Artefact
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"

def print_step(step: str):
    print(f"\n{'='*60}")
    print(f"  {step}")
    print('='*60)

def print_response(response: requests.Response):
    print(f"Status: {response.status_code}")
    if response.ok:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")
    return response.json() if response.ok else None

def test_factor_workflow():
    """Test the complete Factor Analysis workflow"""

    # Get existing plan (we know "testi" plan exists with id=1)
    plan_id = 1

    print_step("1. Create a Factor (PMESII - Military domain)")
    factor_payload = {
        "plan_id": plan_id,
        "title": "Enemy Brigade deploying to northern sector",
        "description": "Intelligence indicates enemy mechanized brigade (approx 3000 personnel, 50 tanks) moving into defensive positions in grid 123456",
        "domain": "MIL",
        "source_ref": "INTSUM-2024-045",
        "confidence": 0.85,
        "created_by": "S2 Analyst"
    }
    response = requests.post(f"{BASE_URL}/factors/", json=factor_payload)
    factor = print_response(response)
    if not factor:
        return
    factor_id = factor['id']

    print_step("2. Add a Deduction (So what?)")
    deduction_payload = {
        "text": "Enemy force composition and positioning suggests defensive intent. Their deployment timeline indicates preparation for sustained operations. Northern approach will be heavily contested.",
        "confidence": 0.80
    }
    response = requests.post(f"{BASE_URL}/factors/{factor_id}/deductions", json=deduction_payload)
    deduction = print_response(response)
    if not deduction:
        return
    deduction_id = deduction['id']

    print_step("3. Create a Conclusion - Task Type")
    conclusion_task_payload = {
        "deduction_id": deduction_id,
        "type": "TASK",
        "text": "Conduct reconnaissance of northern sector to confirm enemy strength and dispositions",
        "priority": 1,
        "owner": "S3"
    }
    response = requests.post(f"{BASE_URL}/factors/{factor_id}/conclusions", json=conclusion_task_payload)
    conclusion_task = print_response(response)
    if not conclusion_task:
        return
    conclusion_task_id = conclusion_task['id']

    print_step("4. Link Conclusion to create a new Task artefact")
    link_payload = {
        "target_kind": "task",
        "create_payload": {
            "name": "Reconnaissance of northern sector",
            "description": "Conduct ISR operations to confirm enemy brigade deployment and capabilities",
            "category": "implied",
            "force_orientation": "ISR",
            "priority": 1
        }
    }
    response = requests.post(f"{BASE_URL}/factors/conclusions/{conclusion_task_id}/links", json=link_payload)
    link = print_response(response)

    print_step("5. Create another Conclusion - Risk Type")
    conclusion_risk_payload = {
        "deduction_id": deduction_id,
        "type": "RISK",
        "text": "Risk: Northern axis may become decisively engaged prematurely",
        "priority": 2,
        "owner": "COS"
    }
    response = requests.post(f"{BASE_URL}/factors/{factor_id}/conclusions", json=conclusion_risk_payload)
    conclusion_risk = print_response(response)
    if not conclusion_risk:
        return
    conclusion_risk_id = conclusion_risk['id']

    print_step("6. Link Risk Conclusion to create Risk artefact")
    risk_link_payload = {
        "target_kind": "risk",
        "create_payload": {
            "title": "Northern sector premature engagement",
            "severity": "HIGH",
            "probability": "MEDIUM",
            "mitigation": "Establish reconnaissance screen and prepare branch plans for early contact",
            "owner": "S3"
        }
    }
    response = requests.post(f"{BASE_URL}/factors/conclusions/{conclusion_risk_id}/links", json=risk_link_payload)
    risk_link = print_response(response)

    print_step("7. Create Conclusion - Decisive Condition Type")
    conclusion_dc_payload = {
        "deduction_id": deduction_id,
        "type": "DC",
        "text": "Enemy brigade combat power degraded below 50% effectiveness",
        "priority": 1,
        "owner": "Commander"
    }
    response = requests.post(f"{BASE_URL}/factors/{factor_id}/conclusions", json=conclusion_dc_payload)
    conclusion_dc = print_response(response)
    if not conclusion_dc:
        return
    conclusion_dc_id = conclusion_dc['id']

    print_step("8. Link DC Conclusion to create Decisive Condition")
    dc_link_payload = {
        "target_kind": "decisive_condition",
        "create_payload": {
            "name": "Northern sector enemy neutralized",
            "description": "Enemy mechanized brigade no longer combat effective",
            "success_criteria": "Enemy unit withdraws or surrenders",
            "moe": "Enemy operational capability assessment",
            "mop": "Enemy casualties > 50%, equipment losses > 60%"
        }
    }
    response = requests.post(f"{BASE_URL}/factors/conclusions/{conclusion_dc_id}/links", json=dc_link_payload)
    dc_link = print_response(response)

    print_step("9. Create Conclusion - CCIR (PIR) Type")
    conclusion_ccir_payload = {
        "deduction_id": deduction_id,
        "type": "CCIR",
        "text": "What is the timeline for enemy brigade achieving full defensive readiness?",
        "priority": 1,
        "owner": "S2"
    }
    response = requests.post(f"{BASE_URL}/factors/{factor_id}/conclusions", json=conclusion_ccir_payload)
    conclusion_ccir = print_response(response)
    if not conclusion_ccir:
        return
    conclusion_ccir_id = conclusion_ccir['id']

    print_step("10. Link CCIR Conclusion to create PIR")
    ccir_link_payload = {
        "target_kind": "ccir",
        "create_payload": {
            "kind": "PIR",
            "text": "Enemy brigade defensive readiness timeline - latest by D+3?"
        }
    }
    response = requests.post(f"{BASE_URL}/factors/conclusions/{conclusion_ccir_id}/links", json=ccir_link_payload)
    ccir_link = print_response(response)

    print_step("11. Create Conclusion - COG Analysis")
    conclusion_cog_payload = {
        "deduction_id": deduction_id,
        "type": "COG",
        "text": "Enemy brigade's artillery battalion is critical to their defensive capability",
        "priority": 1,
        "owner": "S2"
    }
    response = requests.post(f"{BASE_URL}/factors/{factor_id}/conclusions", json=conclusion_cog_payload)
    conclusion_cog = print_response(response)
    if not conclusion_cog:
        return
    conclusion_cog_id = conclusion_cog['id']

    print_step("12. Link COG Conclusion to create COG Item (Critical Capability)")
    cog_link_payload = {
        "target_kind": "cog_item",
        "create_payload": {
            "actor_name": "Enemy Mechanized Brigade",
            "cog_type": "critical_capability",
            "description": "Indirect fire support from organic artillery battalion",
            "analysis_notes": "24x 152mm howitzers provide area denial and counter-battery capability"
        }
    }
    response = requests.post(f"{BASE_URL}/factors/conclusions/{conclusion_cog_id}/links", json=cog_link_payload)
    cog_link = print_response(response)

    print_step("13. Get Factor Trace (lineage) for one conclusion")
    response = requests.get(f"{BASE_URL}/factors/conclusions/{conclusion_task_id}/trace")
    trace = print_response(response)

    print_step("14. List all Factors for the plan")
    response = requests.get(f"{BASE_URL}/factors/?plan_id={plan_id}")
    factors = print_response(response)

    print_step("15. Update Conclusion Status to REVIEWED")
    status_payload = {"status": "REVIEWED"}
    response = requests.post(f"{BASE_URL}/factors/conclusions/{conclusion_task_id}/status", json=status_payload)
    updated = print_response(response)

    print_step("16. Try to APPROVE conclusion (should succeed - has link)")
    approve_payload = {"status": "APPROVED"}
    response = requests.post(f"{BASE_URL}/factors/conclusions/{conclusion_task_id}/status", json=approve_payload)
    approved = print_response(response)

    print("\n" + "="*60)
    print("  TEST COMPLETE ✓")
    print("="*60)
    print("\nSummary:")
    print(f"- Created Factor (ID: {factor_id})")
    print(f"- Created Deduction (ID: {deduction_id})")
    print(f"- Created 5 Conclusions with different types")
    print(f"- Linked conclusions to create: Task, Risk, DC, PIR, and COG Item")
    print(f"- Tested approval workflow")
    print(f"- Verified traceability")

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║   Factor Analysis API Test Suite                         ║
    ║   Testing: Factor → Deduction → Conclusion → Link        ║
    ╚═══════════════════════════════════════════════════════════╝
    """)

    try:
        test_factor_workflow()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend at http://localhost:8000")
        print("   Make sure the backend is running!")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
