from fastapi import FastAPI
from app.api.routes import router
from fastapi.responses import FileResponse

app = FastAPI(title="Face Recognition Attendance System")

app.include_router(router)

@app.get("/")
async def serve_frontend():
    return FileResponse("Frontend/index.html")

@app.get("/admin")
async def serve_admin():
    return FileResponse("Frontend/admin.html")