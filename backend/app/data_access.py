# app/data_access.py
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
import numpy as np
from .db import get_client

def _check(resp, func_name):
    if getattr(resp, "error", None):
        raise RuntimeError(f"{func_name} -> {resp.error}")
    return resp.data

def fetch_questions():
    supabase = get_client()
    resp = supabase.table("questions").select(
        "id, question, level_a, level_b, level_c"
    ).execute()
    rows = _check(resp, "fetch_questions")

    questions = []
    params_by_id = {}
    for r in rows:
        qid = r["id"]
        a = r.get("level_a", 1.0)
        b = r.get("level_b", 0.0)
        c = r.get("level_c", 0.25)
        # Atenção: a chave da pergunta é 'question'
        questions.append({"id": qid, "stem": r["question"]})
        params_by_id[qid] = (a, b, c)
    return questions, params_by_id

def fetch_raw_alternatives():
    supabase = get_client()
    resp = supabase.table("alternatives").select(
        "id, question_id, option, answer, correct"
    ).execute()
    rows = _check(resp, "fetch_raw_alternatives")
    return rows

def record_answer(user_id: Optional[str], question_id: str, selected_option: str, correct: bool) -> None:
    sb = get_client()
    sb.table("user_answers").insert({
        "user_id": user_id,
        "question_id": question_id,
        "selected_option": selected_option,
        "correct": correct
    }).execute()

def check_user_completion(user_id: str, max_questions: int) -> bool:
    supabase = get_client()
    resp = supabase.table("user_answers").select(
        "user_id"
    ).eq("user_id", user_id).execute()
    
    if getattr(resp, "error", None):
        return False
    
    return len(resp.data) >= max_questions