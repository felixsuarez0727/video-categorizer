from typing import List
from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from utils.file_helper import upload_file, list_files, list_json_contents

router = APIRouter()

@router.post("/upload")
def create_upload_file(
    file: UploadFile = File(...), 
    background_tasks: BackgroundTasks = None
):
    try:
        result = upload_file('videobucket-ai', file, background_tasks)
        return JSONResponse(content={"data": result}, status_code=200)
    except HTTPException as e:
        return JSONResponse(content={"error": e.detail}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/bucket/files")
def get_bucket_files():
    files = list_files('videobucket-ai')
    return JSONResponse(content={"data": files}, status_code=200)

@router.get("/bucket/labels")
def get_bucket_files():
    files = list_json_contents()
    return JSONResponse(content={"data": files}, status_code=200)