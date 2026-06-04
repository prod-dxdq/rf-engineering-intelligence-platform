from fastapi import APIRouter

from app.services.link_budget_calculator import analyze_link_budget

# create router variable named router
router = APIRouter()

# create GET endpoint
@router.get("/analyze")
def analyze_link_budget_route(
    tx_power_dbm: float = 30,
    tx_antenna_gain_dbi: float = 15,
    rx_antenna_gain_dbi: float = 5,
    frequency_mhz: float = 2400,
    distance_km: float = 2,
    receiver_sensitivity_dbm: float = -90,
    model: str = "free_space"
):
    result = analyze_link_budget(
        tx_power_dbm,
        tx_antenna_gain_dbi,
        rx_antenna_gain_dbi,
        frequency_mhz,
        distance_km,
        receiver_sensitivity_dbm,
        model
    )

    return result