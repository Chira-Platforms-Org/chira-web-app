from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
from typing import Optional, List
from datetime import datetime
import uuid
from pydantic import BaseModel
import json
from file_processor import FileProcessor
from db_connector import FileDataStore
from utils import get_file_info, save_metadata  # Import utility functions

app = FastAPI(title="CHIRA File Processing Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "processed_files")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize the file processor and data store
file_processor = FileProcessor(UPLOAD_DIR)
file_data_store = FileDataStore()

class FileResponse(BaseModel):
    success: bool
    message: str
    file_info: dict = None
    db_record_id: Optional[int] = None

class FilesListResponse(BaseModel):
    files: List[dict]
    count: int

@app.get("/")
def read_root():
    return {"message": "CHIRA File Processing API"}

# Function to process file in background
async def process_file_background(file_path: str, content_type: str, filename: str, category: str = None, description: str = None):
    """Process a file in the background and save to database"""
    try:
        processed_info = await file_processor.process_file(file_path, content_type, filename)
        
        # Prepare data for database storage
        file_data = {
            "original_filename": filename,
            "stored_filename": os.path.basename(file_path),
            "file_type": processed_info.get("file_type", "unknown"),
            "file_extension": processed_info.get("extension", ""),
            "content_type": content_type,
            "size_bytes": os.path.getsize(file_path),
            "upload_time": datetime.now(),
            "category": category,
            "description": description
        }
        
        # Add extracted content based on file type
        if processed_info.get("file_type") == "document":
            file_data["processed_content"] = processed_info.get("extracted_text", "")
        elif processed_info.get("file_type") == "tabular_data":
            file_data["processed_content"] = processed_info.get("extracted_data", "")
        
        # Save processing metadata as JSON string
        processing_metadata = {
            "statistics": processed_info.get("statistics", {}),
            "summary": processed_info.get("summary", {}),
            "processing_id": processed_info.get("processing_id", ""),
            "processed_at": processed_info.get("processed_at", "")
        }
        file_data["processing_metadata"] = json.dumps(processing_metadata)
        
        # Store binary file data if needed
        if processed_info.get("file_binary"):
            file_data["file_data"] = processed_info.get("file_binary")
        
        # Store in database
        record_id = file_data_store.store_file_record(file_data)
        
        print(f"File processed and stored in database. ID: {record_id}, Filename: {filename}")
        
        # Save metadata to a JSON file for reference (optional)
        metadata_path = f"{file_path}.meta.json"
        with open(metadata_path, "w") as meta_file:
            meta_data = {**file_data}
            if "file_data" in meta_data:
                del meta_data["file_data"]  # Don't store binary in JSON
            if "upload_time" in meta_data:
                meta_data["upload_time"] = meta_data["upload_time"].isoformat()
            json.dump(meta_data, meta_file, indent=2)
            
    except Exception as e:
        print(f"Error in background processing for {filename}: {e}")
        # Save error metadata
        error_metadata = {
            "original_filename": filename,
            "stored_filename": os.path.basename(file_path),
            "content_type": content_type,
            "size_bytes": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            "upload_time": datetime.now().isoformat(),
            "category": category,
            "description": description,
            "processing_status": "error",
            "error": str(e)
        }
        
        metadata_path = f"{file_path}.meta.json"
        with open(metadata_path, "w") as meta_file:
            json.dump(error_metadata, meta_file, indent=2)

@app.post("/process-file/", response_model=FileResponse)
async def process_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    category: str = Form(None),
    description: str = Form(None)
):
    try:
        # Generate a unique filename to avoid conflicts
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Get basic file info
        file_info = get_file_info(file_path, file.filename, file.content_type)
        
        # Process file in the background 
        background_tasks.add_task(
            process_file_background,
            file_path,
            file.content_type,
            file.filename,
            category,
            description
        )
        
        # Return immediate success response
        return FileResponse(
            success=True,
            message=f"File uploaded and being processed: {file.filename}",
            file_info=file_info
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.get("/files/", response_model=FilesListResponse)
async def list_files(category: str = None, file_type: str = None):
    """List processed files, optionally filtered by category or file type"""
    try:
        files = []
        if category:
            db_files = file_data_store.get_files_by_category(category)
        elif file_type:
            # This would need to be implemented in FileDataStore
            db_files = []
        else:
            # We would need a get_all_files method
            db_files = []
            
        for file in db_files:
            files.append({
                "id": file.id,
                "original_filename": file.original_filename,
                "file_type": file.file_type,
                "file_extension": file.file_extension,
                "size_bytes": file.size_bytes,
                "upload_time": file.upload_time.isoformat(),
                "category": file.category,
                "description": file.description
            })
            
        return FilesListResponse(files=files, count=len(files))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@app.get("/files/{file_id}")
async def get_file(file_id: int):
    """Get file details by ID"""
    try:
        file = file_data_store.get_file_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail=f"File with ID {file_id} not found")
            
        # Convert file object to dict for response
        file_data = {
            "id": file.id,
            "original_filename": file.original_filename,
            "file_type": file.file_type,
            "file_extension": file.file_extension,
            "content_type": file.content_type,
            "size_bytes": file.size_bytes,
            "upload_time": file.upload_time.isoformat(),
            "category": file.category,
            "description": file.description,
            "processing_metadata": json.loads(file.processing_metadata) if file.processing_metadata else {}
        }
        
        # Include processed content if available
        if file.processed_content:
            if file.file_type == "document":
                file_data["text_content"] = file.processed_content
            elif file.file_type == "tabular_data":
                file_data["data"] = json.loads(file.processed_content)
                
        return file_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving file: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
