"""
Utility functions for CHIRA File Processing Service
"""
import os
import json
import shutil
from typing import Dict, Any, List, Optional
from datetime import datetime
import mimetypes

def get_file_extension(filename: str) -> str:
    """Get the lowercase extension from a filename."""
    return os.path.splitext(filename)[1].lower()

def get_file_mimetype(filepath: str) -> str:
    """Detect MIME type of a file."""
    mime_type, _ = mimetypes.guess_type(filepath)
    if mime_type is None:
        # Default fallback if unable to determine
        return 'application/octet-stream'
    return mime_type

def get_file_info(filepath: str) -> Dict[str, Any]:
    """Get basic file information."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
    
    filename = os.path.basename(filepath)
    
    return {
        "filename": filename,
        "size_bytes": os.path.getsize(filepath),
        "last_modified": datetime.fromtimestamp(os.path.getmtime(filepath)).isoformat(),
        "extension": get_file_extension(filename),
        "mime_type": get_file_mimetype(filepath)
    }

def save_metadata(metadata: Dict[str, Any], filepath: str) -> str:
    """Save metadata to a JSON file and return the path."""
    metadata_path = f"{filepath}.meta.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    return metadata_path

def load_metadata(metadata_path: str) -> Dict[str, Any]:
    """Load metadata from a JSON file."""
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
    
    with open(metadata_path, 'r') as f:
        return json.load(f)

def ensure_directory(directory: str) -> None:
    """Ensure a directory exists, create if it doesn't."""
    os.makedirs(directory, exist_ok=True)

def move_file(src: str, dest: str) -> None:
    """Move a file from source to destination."""
    shutil.move(src, dest)

def delete_file(filepath: str) -> bool:
    """Delete a file and its metadata if it exists."""
    if os.path.exists(filepath):
        os.remove(filepath)
        # Also delete metadata if it exists
        metadata_path = f"{filepath}.meta.json"
        if os.path.exists(metadata_path):
            os.remove(metadata_path)
        return True
    return False

def clear_directory(directory: str, exclude_patterns: List[str] = None) -> int:
    """
    Clear all files from a directory except those matching exclude patterns.
    Returns the number of files deleted.
    """
    if not os.path.exists(directory):
        return 0
    
    exclude_patterns = exclude_patterns or []
    count = 0
    
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        
        # Skip if file matches any exclude pattern
        if any(pattern in filename for pattern in exclude_patterns):
            continue
            
        if os.path.isfile(filepath):
            os.remove(filepath)
            count += 1
            
    return count
