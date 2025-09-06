# app/db.py
from supabase import create_client, Client
from .config import get_settings

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        # Use service role key if available
        supabase_key = settings.service_role_key or settings.supabase_key
        _client = create_client(settings.supabase_url, supabase_key)
    return _client
