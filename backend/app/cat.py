# app/cat.py
from typing import Dict, List
import random
from .data_access import record_answer

# Sessões em memória por usuário
user_sessions: Dict[str, dict] = {}
MAX_QUESTIONS_PER_USER = 10

def init_cat(user_id: str, questions_data: List[dict], alternatives_data: List[dict]):
    """Inicializa sessão do usuário adaptativa"""
    if user_id in user_sessions:
        return user_sessions[user_id]

    # Embaralha e limita perguntas
    questions = []
    alts_by_qid = {q["id"]: [] for q in questions_data}
    for alt in alternatives_data:
        qid = alt["question_id"]
        if qid in alts_by_qid:
            alts_by_qid[qid].append(alt)

    for q in questions_data:
        qid = q["id"]
        alts = alts_by_qid.get(qid, [])
        opts_map = {a["option"]: a["answer"] for a in alts}
        correct = next((a["option"] for a in alts if a.get("correct")), None)
        if opts_map and correct:
            questions.append({
                "id": qid,
                "stem": q["question"],
                "options": opts_map,
                "correct": correct
            })

    random.shuffle(questions)
    questions = questions[:MAX_QUESTIONS_PER_USER]

    session = {
        "questions": questions,
        "asked": [],
        "theta": 0.0,
        "max_questions": len(questions)
    }
    user_sessions[user_id] = session
    return session

def get_next_question(user_id: str):
    session = user_sessions.get(user_id)
    if not session:
        return None

    remaining = [q for q in session["questions"] if q["id"] not in session["asked"]]
    return remaining[0] if remaining else None

def submit_answer(user_id: str, question_id: str, selected_option: str):
    session = user_sessions.get(user_id)
    if not session:
        raise RuntimeError("Sessão não encontrada")

    # Marca como respondida
    session["asked"].append(question_id)
    question = next(q for q in session["questions"] if q["id"] == question_id)
    correct = selected_option == question.get("correct")

    # Atualiza theta de forma simples (mock)
    session["theta"] += 1 if correct else -0.5

    # Salva no Supabase
    record_answer(user_id, question_id, selected_option, correct)

    # Retorno completo para o frontend
    return {
        "correct": correct,
        "theta": session["theta"],
        "remaining": session["max_questions"] - len(session["asked"])
    }
