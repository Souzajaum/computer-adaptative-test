# app/cat.py
from typing import Dict, List
import random
import numpy as np
from .data_access import record_answer
from .irt import eap_theta, fisher_information

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

    item_params = []
    for q in questions_data:
        qid = q["id"]
        alts = alts_by_qid.get(qid, [])
        opts_map = {a["option"]: a["answer"] for a in alts}
        correct_alt = next((a for a in alts if a.get("correct")), None)
        
        if opts_map and correct_alt:
            questions.append({
                "id": qid,
                "stem": q["question"],
                "options": opts_map,
                "correct": correct_alt["option"]
            })
            # Adiciona os parâmetros do item (a, b, c)
            item_params.append((q.get('a', 1.0), q.get('b', 0.0), q.get('c', 0.25)))


    # Embaralha as questões e os parâmetros de forma consistente
    if questions:
        combined = list(zip(questions, item_params))
        random.shuffle(combined)
        shuffled_questions, shuffled_item_params = zip(*combined)
        
        questions = list(shuffled_questions)[:MAX_QUESTIONS_PER_USER]
        item_params = list(shuffled_item_params)[:MAX_QUESTIONS_PER_USER]
    else:
        questions = []
        item_params = []


    session = {
        "questions": questions,
        "item_params": np.array(item_params),
        "asked": [],
        "responses": [],
        "theta": 0.0,
        "max_questions": len(questions)
    }
    user_sessions[user_id] = session
    return session

def get_next_question(user_id: str):
    session = user_sessions.get(user_id)
    if not session:
        return None

    remaining_indices = [i for i, q in enumerate(session["questions"]) if q["id"] not in session["asked"]]
    
    if not remaining_indices:
        return None

    # Lógica para selecionar a próxima questão com base na máxima informação de Fisher
    current_theta = session["theta"]
    best_item_index = -1
    max_info = -1

    for index in remaining_indices:
        a, b, c = session["item_params"][index]
        info = fisher_information(a, b, c, current_theta)
        
        if info > max_info:
            max_info = info
            best_item_index = index

    # Se nenhum item tiver informação > 0 (caso raro), apenas pega o próximo
    if best_item_index == -1:
        best_item_index = remaining_indices[0]

    return session["questions"][best_item_index]


def submit_answer(user_id: str, question_id: str, selected_option: str):
    session = user_sessions.get(user_id)
    if not session:
        raise RuntimeError("Sessão não encontrada")

    question_index = -1
    for i, q in enumerate(session["questions"]):
        if q["id"] == question_id:
            question_index = i
            break
    
    if question_index == -1:
        raise RuntimeError("Questão não encontrada na sessão")

    question = session["questions"][question_index]
    correct = selected_option == question.get("correct")
    
    # Adiciona o índice da questão e a resposta (1 para correta, 0 para incorreta)
    session["asked"].append(question_id)
    session["responses"].append(1 if correct else 0)

    # Mapeia IDs de questões para índices
    question_id_to_index = {q["id"]: i for i, q in enumerate(session["questions"])}
    administered_indices = [question_id_to_index[qid] for qid in session["asked"]]

    # Atualiza theta usando EAP
    session["theta"] = eap_theta(
        items=session["item_params"],
        administered=administered_indices,
        responses=session["responses"],
        grid_min=-4.0,
        grid_max=4.0,
        grid_size=50
    )

    # Salva no Supabase
    record_answer(user_id, question_id, selected_option, correct)

    # Retorno completo para o frontend
    return {
        "correct": correct,
        "theta": session["theta"],
        "remaining": session["max_questions"] - len(session["asked"])
    }
