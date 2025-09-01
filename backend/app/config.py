# app/config.py
from __future__ import annotations
import os
from dataclasses import dataclass
from dotenv import load_dotenv
from functools import lru_cache

load_dotenv()

@dataclass
class Settings:
    supabase_url: str
    supabase_key: str
    initial_theta: float
    max_questions: int
    grid_min: float
    grid_max: float
    grid_size: int

@lru_cache
def get_settings() -> Settings:
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_ANON_KEY", "").strip()
    if not url or not key:
        raise RuntimeError("Defina SUPABASE_URL e SUPABASE_ANON_KEY no .env")
    return Settings(
        supabase_url=url,
        supabase_key=key,
        initial_theta=float(os.getenv("INITIAL_THETA", 0.0)),
        max_questions=int(os.getenv("MAX_QUESTIONS", 10)),
        grid_min=float(os.getenv("GRID_MIN", -4.0)),
        grid_max=float(os.getenv("GRID_MAX", 4.0)),
        grid_size=int(os.getenv("GRID_SIZE", 161))
    )
