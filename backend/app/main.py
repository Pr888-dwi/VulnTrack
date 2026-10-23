
from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal
from app.db_models import Base, VulnerabilityDB
from app.models import (
    Severity,
    Vulnerability,
    VulnerabilityCreate,
    VulnerabilityStatus,
    VulnerabilityUpdate,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="VulnTrack API",
    description="Vulnerability Tracking and Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def get_session():
    return SessionLocal()


def to_response(item: VulnerabilityDB) -> Vulnerability:
    return Vulnerability(
        id=UUID(item.id),
        title=item.title,
        description=item.description,
        severity=item.severity,
        affected_asset=item.affected_asset,
        status=item.status,
        created_at=item.created_at,
    )


@app.get("/")
def home():
    return {"message": "Welcome to VulnTrack API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/vulnerabilities", response_model=Vulnerability, status_code=201)
def create_vulnerability(data: VulnerabilityCreate):
    with get_session() as db:
        item = VulnerabilityDB(
            title=data.title,
            description=data.description,
            severity=data.severity,
            affected_asset=data.affected_asset,
            status="Open",
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return to_response(item)


@app.get("/vulnerabilities", response_model=list[Vulnerability])
def list_vulnerabilities(
    severity: Severity | None = None,
    vulnerability_status: VulnerabilityStatus | None = Query(
        default=None, alias="status"
    ),
    search: str | None = Query(default=None, max_length=200),
):
    with get_session() as db:
        query = db.query(VulnerabilityDB)

        if severity:
            query = query.filter(VulnerabilityDB.severity == severity)

        if vulnerability_status:
            query = query.filter(
                VulnerabilityDB.status == vulnerability_status
            )

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                VulnerabilityDB.title.ilike(term)
                | VulnerabilityDB.description.ilike(term)
                | VulnerabilityDB.affected_asset.ilike(term)
            )

        items = query.order_by(VulnerabilityDB.created_at.desc()).all()
        return [to_response(item) for item in items]


@app.get("/vulnerabilities/{vulnerability_id}", response_model=Vulnerability)
def get_vulnerability(vulnerability_id: UUID):
    with get_session() as db:
        item = db.get(VulnerabilityDB, str(vulnerability_id))

        if item is None:
            raise HTTPException(
                status_code=404,
                detail="Vulnerability not found",
            )

        return to_response(item)


@app.patch(
    "/vulnerabilities/{vulnerability_id}/status",
    response_model=Vulnerability,
)
def update_vulnerability_status(
    vulnerability_id: UUID,
    update: VulnerabilityUpdate,
):
    with get_session() as db:
        item = db.get(VulnerabilityDB, str(vulnerability_id))

        if item is None:
            raise HTTPException(
                status_code=404,
                detail="Vulnerability not found",
            )

        item.status = update.status
        db.commit()
        db.refresh(item)
        return to_response(item)


@app.delete("/vulnerabilities/{vulnerability_id}", status_code=204)
def delete_vulnerability(vulnerability_id: UUID):
    with get_session() as db:
        item = db.get(VulnerabilityDB, str(vulnerability_id))

        if item is None:
            raise HTTPException(
                status_code=404,
                detail="Vulnerability not found",
            )

        db.delete(item)
        db.commit()
        return Response(status_code=204)
