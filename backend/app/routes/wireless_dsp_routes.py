from fastapi import APIRouter

from app.services.wireless_dsp_calculator import analyze_wireless_dsp, simulate_ber_vs_snr

router = APIRouter()
ber_vs_snr = simulate_ber_vs_snr()

@router.get("/analyze")
def analyze_wireless_dsp_endpoint():
    return {
        "status": "success",
        "results": analyze_wireless_dsp(),
        "ber_vs_snr": ber_vs_snr,
    }
