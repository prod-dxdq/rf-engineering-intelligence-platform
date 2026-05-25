from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.cascade_routes import router as cascade_router
from app.routes.wireless_dsp_routes import router as wireless_dsp_router

app = FastAPI(
    title="RF Engineering Intelligence Platform"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(
    cascade_router,
    prefix="/cascade",
    tags=["Cascade Analysis"]
)

app.include_router(
    wireless_dsp_router,
    prefix="/wireless-dsp",
    tags=["Wireless DSP Analysis"]
)


@app.get("/")
def root():
    return {
        "message": "RF Engineering Intelligence Platform Backend Running"
    }