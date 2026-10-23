
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


Severity = Literal["Critical", "High", "Medium", "Low"]
VulnerabilityStatus = Literal["Open", "In Progress", "Resolved"]


class VulnerabilityCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=2000)
    severity: Severity
    affected_asset: str = Field(min_length=1, max_length=200)


class VulnerabilityUpdate(BaseModel):
    status: VulnerabilityStatus


class Vulnerability(VulnerabilityCreate):
    id: UUID = Field(default_factory=uuid4)
    status: VulnerabilityStatus = "Open"
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
