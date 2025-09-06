# app/data_access.py
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
import numpy as np
from .db import get_client

def fetch_questions() -> List[dict]:
    sb = get_client()
    try:
        res = sb.table("questions").select("id, question, level_a, level_b, level_c").execute()
        return res.data or []
    except Exception as e:
        print(f"Erro ao buscar questões: {e}")
        raise

def fetch_alternatives(page_size: int = 2000) -> List[dict]:
    sb = get_client()
    all_rows: List[dict] = []
    page = 0
    while True:
        start = page * page_size
        end = start + page_size - 1
        res = sb.table("alternatives")\
            .select("question_id, answer, option, correct")\
            .range(start, end)\
            .order("option")\
            .execute()
        rows = res.data or []
        all_rows.extend(rows)
        if len(rows) < page_size:
            break
        page += 1
    return all_rows

def build_item_bank(
    questions: List[dict],
    alternatives: List[dict],
    require_all_four: bool = True,
) -> Tuple[np.ndarray, List[str], List[str], List[Dict[str, str]], List[Optional[str]]]:
    alts_by_qid: Dict[str, List[dict]] = defaultdict(list)
    for r in alternatives:
        opt = str(r.get("option","")).strip().upper()[:1]
        if opt in {"A","B","C","D"}:
            r["option"] = opt
            alts_by_qid[r["question_id"]].append(r)

    item_rows, qids, stems, opts_list, correct_letters = [], [], [], [], []
    expected = {"A","B","C","D"}
    for q in questions:
        qid = q["id"]
        stem = q.get("question","")
        a = float(q.get("level_a",1.0))
        b = float(q.get("level_b",0.0))
        c = float(q.get("level_c",0.2))
        alts = alts_by_qid.get(qid, [])
        present_set = {r["option"] for r in alts}
        if require_all_four and present_set != expected:
            continue
        opts_map = {opt: next((r.get("answer","") for r in alts if r["option"]==opt),"") for opt in expected}
        correct_opt = next((r["option"] for r in alts if bool(r.get("correct"))), None)
        item_rows.append([a,b,c,1.0,0.0])
        qids.append(qid)
        stems.append(stem)
        opts_list.append(opts_map)
        correct_letters.append(correct_opt)
    if not item_rows:
        raise RuntimeError("Nenhum item válido encontrado.")
    return np.array(item_rows,dtype=float), qids, stems, opts_list, correct_letters

def record_answer(user_id: Optional[str], question_id: str, selected_option: str, correct: bool) -> None:
    sb = get_client()
    sb.table("user_answers").insert({
        "user_id": user_id,
        "question_id": question_id,
        "selected_option": selected_option,
        "correct": correct
    }).execute()
