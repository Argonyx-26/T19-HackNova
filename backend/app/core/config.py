import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "SENTINEL-X"
    PROJECT_TAGLINE: str = "From Alerts to Situations"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server Binding
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # MongoDB Atlas
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "sentinel_x"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    # Contextual Correlation Settings
    CORRELATION_WINDOW_SECONDS: int = 120  # temporal proximity window in seconds

settings = Settings()
