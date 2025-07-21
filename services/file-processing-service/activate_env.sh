#!/bin/bash
# Script to activate the virtual environment and run the file processing service

# Activate the virtual environment
source venv/bin/activate

# Run the FastAPI application with uvicorn on port 8004 (changed from 8003)
uvicorn main:app --host 0.0.0.0 --port 8004 --reload
