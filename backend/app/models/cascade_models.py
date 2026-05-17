from typing import List

from pydantic import AliasChoices, BaseModel, Field


class RFStage(BaseModel):
    name: str
    gain_db: float = Field(
        ..., validation_alias=AliasChoices("gain_db", "gain_dB")
    )
    noise_figure_db: float = Field(
        ..., validation_alias=AliasChoices("noise_figure_db", "noise_figure_dB")
    )
    ip3_dbm: float | None = Field(
        default=None,
        validation_alias=AliasChoices("ip3_dbm", "ip3_dBm"),
    )

class CascadeRequest(BaseModel):
    stages: List[RFStage]

class CascadeResponse(BaseModel):
    total_gain_dB: float
    total_noise_figure_dB: float
    input_ip3_dBm: float | None = None