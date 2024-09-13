from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.v1 import (
    file_management_router
)

origins = [
    "*"
]

app = FastAPI(title="Video Categorizer",
    description="Backend Video Categorizer Powered by AI",
    version="1.0.0",
    docs_url="/docs")


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST","PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(file_management_router.router, prefix="/v1", tags=["Dashboard Auth"])


