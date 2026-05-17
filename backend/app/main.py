from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.cascade_routes import router as cascade_router

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


@app.get("/")
def root():
    return {
        "message": "RF Engineering Intelligence Platform Backend Running"
    }