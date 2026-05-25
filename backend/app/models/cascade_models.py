from typing import List

from pydantic import AliasChoices, BaseModel, Field


class RFStage(BaseModel):
    name: str
    gain_dB: float = Field(
        ...,
        validation_alias=AliasChoices("gain_db", "gain_dB"),
        examples=[18.5],
    )
    noise_figure_dB: float = Field(
        ...,
        validation_alias=AliasChoices("noise_figure_db", "noise_figure_dB"),
        examples=[0.8],
    )
    ip3_dBm: float | None = Field(
        default=None,
        validation_alias=AliasChoices("ip3_dbm", "ip3_dBm"),
        examples=[22.0],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "LNA",
                "gain_dB": 18.5,
                "noise_figure_dB": 0.8,
                "ip3_dBm": 22.0,
            }
        }
    }

class CascadeRequest(BaseModel):
    stages: List[RFStage]

    model_config = {
        "json_schema_extra": {
            "example": {
                "stages": [
                    {
                        "name": "LNA",
                        "gain_dB": 18.5,
                        "noise_figure_dB": 0.8,
                        "ip3_dBm": 22.0,
                    },
                    {
                        "name": "Mixer",
                        "gain_dB": -6.5,
                        "noise_figure_dB": 8.2,
                        "ip3_dBm": 15.0,
                    },
                    {
                        "name": "IF Amp",
                        "gain_dB": 25.0,
                        "noise_figure_dB": 3.5,
                        "ip3_dBm": 28.0,
                    },
                ]
            }
        }
    }


class StageAnalysisItem(BaseModel):
    stage: str
    cumulative_gain_dB: float
    stage_noise_figure_dB: float
    stage_ip3_dBm: float | None = None


class SpectrumPoint(BaseModel):
    frequency_hz: float
    magnitude: float


class QpskConstellationPoint(BaseModel):
    i: float
    q: float


class CascadeResponse(BaseModel):
    total_gain_dB: float
    total_noise_figure_dB: float
    input_ip3_dBm: float | None = None
    output_ip3_dBm: float | None = None
    dynamic_range_estimate_dB: float | None = None
    receiver_sensitivity_dBm: float | None = None
    stage_analysis: List[StageAnalysisItem] = Field(default_factory=list)
    spectrum_data: List[SpectrumPoint] = Field(default_factory=list)
    qpsk_constellation: List[QpskConstellationPoint] = Field(default_factory=list)


class AnalyzeCascadeResponse(BaseModel):
    status: str
    results: CascadeResponse

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "success",
                "results": {
                    "total_gain_dB": 37.0,
                    "total_noise_figure_dB": 1.33,
                    "input_ip3_dBm": -3.56,
                    "output_ip3_dBm": 33.44,
                    "dynamic_range_estimate_dB": -4.89,
                    "receiver_sensitivity_dBm": -102.67,
                    "stage_analysis": [
                        {
                            "stage": "LNA",
                            "cumulative_gain_dB": 18.5,
                            "stage_noise_figure_dB": 0.8,
                            "stage_ip3_dBm": 22.0,
                        }
                    ],
                    "spectrum_data": [
                        {
                            "frequency_hz": 0.0,
                            "magnitude": 4.7406523151494184e-14,
                        },
                        {
                            "frequency_hz": 1.0,
                            "magnitude": 0.019823016174585543,
                        }
                    ],
                    "qpsk_constellation": [
                        {"i": 1.0, "q": 1.0},
                        {"i": 1.0, "q": -1.0},
                        {"i": -1.0, "q": 1.0},
                        {"i": -1.0, "q": -1.0}
                    ],
                },
            }
        }
    }