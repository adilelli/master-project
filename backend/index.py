from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.evaluation_routes import router as evaluation_router
from routes.user_routes import router as user_router
from routes.auth_routes import router as auth_router

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(evaluation_router, prefix="/evaluation")
app.include_router(user_router, prefix="/user")
app.include_router(auth_router, prefix="/auth")

@app.get("/", tags=["Root"])
async def root():
    return {"ok": "cool"}
