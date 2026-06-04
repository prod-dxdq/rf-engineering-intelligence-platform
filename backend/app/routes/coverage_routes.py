from fastapi import APIRouter

from app.services.coverage_calculator import (
    generate_coverage_prediction,
    generate_coverage_comparison
)

# create router
router = APIRouter()

# create GET endpoint
# path: /analyze
@router.get("/analyze")
def analyze_coverage(
    tx_power_dbm: float = 30,
    tx_antenna_gain_dbi: float = 10,
    rx_antenna_gain_dbi: float = 10,
    frequency_mhz: float = 2400,
    receiver_sensitivity_dbm: float = -90,
    model: str = "free_space"
):
    # call generate_coverage_prediction
    coverage_data, farthest_covered_distance_km = generate_coverage_prediction(
        tx_power_dbm,
        tx_antenna_gain_dbi,
        rx_antenna_gain_dbi,
        frequency_mhz,
        receiver_sensitivity_dbm,
        model
    )

    # call generate_coverage_comparison
    comparison_data = generate_coverage_comparison(
        tx_power_dbm,
        tx_antenna_gain_dbi,
        rx_antenna_gain_dbi,
        frequency_mhz,
        receiver_sensitivity_dbm
    )

    # return coverage data
    return {
        "coverage_data": coverage_data,
        "farthest_covered_distance_km": farthest_covered_distance_km,
        "comparison_data": comparison_data
    }