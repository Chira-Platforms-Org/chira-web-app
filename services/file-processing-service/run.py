#!/usr/bin/env python3
"""
Run script for CHIRA File Processing Service
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", 
                host="0.0.0.0", 
                port=8001,  # Changed from 8000 to 8001
                reload=True,
                reload_excludes=["*.json", "*.meta.json"])
