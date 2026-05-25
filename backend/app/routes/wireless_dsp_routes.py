from fastapi import APIRouter

from app.services.wireless_dsp_calculator import analyze_wireless_dsp

router = APIRouter()


@router.get("/analyze")
def analyze_wireless_dsp_endpoint():
    return {
        "status": "success",
        "results": analyze_wireless_dsp(),
    }
