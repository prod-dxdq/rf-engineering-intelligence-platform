from fastapi import APIRouter

from app.models.cascade_models import AnalyzeCascadeResponse, CascadeRequest
from app.services.cascade_calculator import analyze_receiver_chain

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeCascadeResponse)
def analyze_cascade(request: CascadeRequest):
    stages = [stage.model_dump() for stage in request.stages]

    results = analyze_receiver_chain(stages)

    return {
        "status": "success",
        "results": results
    }