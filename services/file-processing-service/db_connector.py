from sqlalchemy import create_engine, Column, Integer, String, Text, TIMESTAMP, LargeBinary, MetaData, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PostgreSQL connection settings with fallback to SQLite for development/testing
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/chira_files")
FALLBACK_DB = os.environ.get("FALLBACK_DB", "sqlite:///./file_records.db")

# Initialize database components
Base = declarative_base()

class FileRecord(Base):
    """Table for storing file metadata and contents"""
    __tablename__ = "file_records"

    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # document, spreadsheet, etc.
    file_extension = Column(String(20), nullable=False)
    content_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    upload_time = Column(TIMESTAMP, nullable=False)
    category = Column(String(100))
    description = Column(Text)
    processed_content = Column(Text)  # Extracted text content from the file
    processing_metadata = Column(Text)  # Additional processing metadata as JSON
    file_data = Column(LargeBinary, nullable=True)  # For storing the entire file if needed

class FileDataStore:
    """Handles database operations for file data"""
    
    def __init__(self):
        """Initialize the database if not exists"""
        try:
            # Try to connect to PostgreSQL
            logger.info(f"Attempting to connect to database: {DATABASE_URL}")
            self.engine = create_engine(DATABASE_URL)
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
            
            # Test connection
            with self.engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database")
            
            Base.metadata.create_all(bind=self.engine)
            self.db_available = True
        except Exception as e:
            logger.warning(f"PostgreSQL connection failed: {e}")
            logger.info(f"Falling back to SQLite database: {FALLBACK_DB}")
            
            # Fallback to SQLite
            try:
                self.engine = create_engine(FALLBACK_DB)
                self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
                Base.metadata.create_all(bind=self.engine)
                self.db_available = True
                logger.info("Successfully connected to SQLite database")
            except Exception as sqlite_error:
                logger.error(f"SQLite fallback also failed: {sqlite_error}")
                self.db_available = False
                self.engine = None
                self.SessionLocal = None
                logger.warning("Running without database functionality")
        
    def store_file_record(self, file_data):
        """Store file metadata and processed content in the database"""
        if not self.db_available:
            logger.warning("Database not available. File metadata will not be stored in database.")
            # Save to local JSON file as fallback
            file_id = file_data.get("processing_id", datetime.now().isoformat())
            json_path = f"processed_files/{file_id}.json"
            temp_data = {k: str(v) if isinstance(v, (datetime, bytes)) else v for k, v in file_data.items()}
            with open(json_path, "w") as f:
                json.dump(temp_data, f, indent=2)
            logger.info(f"File metadata saved to {json_path}")
            return file_id
            
        try:
            db = self.SessionLocal()
            new_record = FileRecord(**file_data)
            db.add(new_record)
            db.commit()
            db.refresh(new_record)
            return new_record.id
        except Exception as e:
            if db:
                db.rollback()
            logger.error(f"Error storing file record: {e}")
            raise e
        finally:
            if db:
                db.close()
    
    def get_file_by_id(self, file_id):
        """Retrieve file by ID"""
        if not self.db_available:
            logger.warning("Database not available. Cannot retrieve file by ID.")
            return None
            
        db = self.SessionLocal()
        try:
            return db.query(FileRecord).filter(FileRecord.id == file_id).first()
        except Exception as e:
            logger.error(f"Error retrieving file by ID: {e}")
            return None
        finally:
            db.close()
    
    def get_files_by_category(self, category):
        """Get all files in a specific category"""
        if not self.db_available:
            logger.warning("Database not available. Cannot retrieve files by category.")
            return []
            
        db = self.SessionLocal()
        try:
            return db.query(FileRecord).filter(FileRecord.category == category).all()
        except Exception as e:
            logger.error(f"Error retrieving files by category: {e}")
            return []
        finally:
            db.close()
    
    def get_files_by_extension(self, extension):
        """Get all files with a specific extension"""
        if not self.db_available:
            logger.warning("Database not available. Cannot retrieve files by extension.")
            return []
            
        db = self.SessionLocal()
        try:
            return db.query(FileRecord).filter(FileRecord.file_extension == extension).all()
        except Exception as e:
            logger.error(f"Error retrieving files by extension: {e}")
            return []
        finally:
            db.close()
            
    def get_all_files(self, limit=100, offset=0):
        """Get all files with pagination"""
        if not self.db_available:
            logger.warning("Database not available. Cannot retrieve all files.")
            return []
            
        db = self.SessionLocal()
        try:
            return db.query(FileRecord).order_by(FileRecord.upload_time.desc()).offset(offset).limit(limit).all()
        except Exception as e:
            logger.error(f"Error retrieving all files: {e}")
            return []
        finally:
            db.close()
