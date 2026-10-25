from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes_auth import router as auth_router
from routes_drives import router as drives_router
from routes_candidates import router as candidates_router
from routes_interviewers import router as interviewers_router
from routes_rooms import router as rooms_router
from routes_availability import router as availability_router
from routes_scheduling import router as scheduling_router
from routes_candidate_booking import router as candidate_booking_router




def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Slotify timetable & scheduling backend API with Supabase PostgreSQL integration",
    )

    # Enable CORS for configured origins only
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include Auth and CRUD routers
    app.include_router(auth_router)
    app.include_router(drives_router)
    app.include_router(candidates_router)
    app.include_router(interviewers_router)
    app.include_router(rooms_router)
    app.include_router(availability_router)
    app.include_router(scheduling_router)
    app.include_router(candidate_booking_router)



    @app.get("/")
    def read_root():
        return {
            "message": "Welcome to Slotify API",
            "status": "running",
            "version": settings.APP_VERSION,
        }

    @app.get("/health")
    def health_check():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
        }

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
