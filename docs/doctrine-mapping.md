# Doctrine Mapping

## COPD / AJP-5 Lifecycle Coverage
- **Initiation ? Mission Analysis:** Plan wizard captures initiating directive metadata, factor analysis, and early decision rationale.
- **COA Development:** COA board lanes surface tasks grouped by doctrinal category, preparing drag-and-drop enhancements.
- **COA Analysis / Wargame:** TTL view aligns tasks across time/location; TTR engine stub records force package reasoning.
- **COA Comparison:** Quick metrics panel aggregates derivatives (risks, constraints, decisions) for commander review.
- **Commander Decision:** Decision capture log ties key decisions to artefacts for CPM-lite traceability.
- **CONOPS Export:** FastAPI export service composes markdown output aligned with COPD Annex templates.

## Factor ? Deduction ? Conclusion Linkage
- `POST /factors` builds environmental factors.
- `POST /factors/{id}/deductions` captures analysis outputs.
- `POST /factors/{id}/conclusions` tags conclusions by doctrinal type.
- `POST /factors/conclusions/{id}/links` auto-creates constraints, risks, DCs, DPs, CCIRs, and sync rows with `derived_from` metadata creating a traceable lineage for audits and exports.

## TTL / TTR Integration
- TTL records connect tasks to phases, COAs, and areas with relative M/C/D-Day offsets.
- TTR service ingests TTL context, applies heuristics, and persists recommended force packages (`ttr_result`).
- Map component reserved for MapLibre GL with offline MBTiles served from `app/client/src/assets/tiles`.

## Exports & Audit
- `/exports/conops` generates Markdown content containing phases, TTL summary, and commander decisions.
- `/decisions` endpoints maintain commander rationale with automatic audit log entries under `/audit/logs`.

## Offline Readiness Checklist
- FastAPI + SQLite default, upgrade to Postgres/PostGIS via `DATABASE_URL`.
- MapLibre compatible offline basemap path: `src/assets/tiles/*.mbtiles` (configure local tileserver for production).
- Seed data scripts under `app/infra/seed` (populate units, RIC codes, sample scenario).
