# app/cat.py
from typing import Dict, List
import random
import numpy as np
from .data_access import record_answer
from .irt import eap_theta, fisher_information

user_sessions: Dict[str, dict] = {}
MAX_QUESTIONS_PER_USER = 20

def init_cat(user_id: str, questions_data: List[dict], alternatives_data: List[dict]):
    if user_id in user_sessions:
        return user_sessions[user_id]

    # Agrupa alternativas por ID da questão
    alts_by_qid = {}
    for alt in alternatives_data:
        qid = alt["question_id"]
        if qid not in alts_by_qid:
            alts_by_qid[qid] = []
        alts_by_qid[qid].append(alt)

    item_bank = []
    ready_questions = []

    for q in questions_data:
        qid = q["id"]
        alts = alts_by_qid.get(qid)
        if alts:
            correct_option_key = None
            options_dict = {}
            for alt_data in alts:
                option_key = alt_data["option"]
                options_dict[option_key] = alt_data["answer"]
                if alt_data.get("correct"):
                    correct_option_key = option_key
            
            # Se a pergunta tiver alternativas e uma resposta correta
            if correct_option_key:
                ready_questions.append({
                    "id": qid,
                    "stem": q["stem"],
                    "options": options_dict,
                    "correct": correct_option_key
                })
                item_bank.append({
                    "id": qid,
                    "a": q.get("level_a", 1.0),
                    "b": q.get("level_b", 0.0),
                    "c": q.get("level_c", 0.25)
                })

    if not ready_questions:
        raise RuntimeError("Nenhuma questão válida encontrada. Verifique se as perguntas têm alternativas e uma resposta correta.")

    # Embaralha as perguntas e os parâmetros de forma consistente
    combined = list(zip(ready_questions, item_bank))
    random.shuffle(combined)
    ready_questions, item_bank = zip(*combined)

    session = {
        "theta": 0.0,
        "questions": list(ready_questions),
        "item_params": list(item_bank),
        "asked": [],
        "responses": [],
        "num_questions_asked": 0,
        "completed": False, # Adiciona a nova chave de estado
    }
    user_sessions[user_id] = session

    return session

def get_next_question(user_id: str):
    session = user_sessions.get(user_id)
    if not session:
        raise RuntimeError("Sessão não encontrada. Por favor, inicie um quiz primeiro.")
    
    if session["num_questions_asked"] >= MAX_QUESTIONS_PER_USER:
        return None

    # Encontra a próxima questão mais informativa
    best_info = -1
    best_question_id = None
    
    available_q_ids = [q["id"] for q in session["questions"] if q["id"] not in session["asked"]]
    
    # Se não houver mais perguntas disponíveis
    if not available_q_ids:
        return None
        
    for q_id in available_q_ids:
        q_idx = next(i for i, q in enumerate(session["questions"]) if q["id"] == q_id)
        params = session["item_params"][q_idx]
        info = fisher_information(params["a"], params["b"], params["c"], session["theta"])
        
        if info > best_info:
            best_info = info
            best_question_id = q_id
    
    if best_question_id:
        # Encontra a questão com o ID selecionado
        question = next(q for q in session["questions"] if q["id"] == best_question_id)
        return question
    
    return None

# app/cat.py

# ... (código existente da função init_cat e get_next_question)

from loguru import logger
import numpy as np
from .data_access import record_answer
from .irt import eap_theta

# ... (código existente da função init_cat e get_next_question)

def submit_answer(user_id: str, question_id: str, selected_option: str):
    session = user_sessions.get(user_id)
    if not session:
        raise RuntimeError("Sessão não encontrada")
    
    question_index = next((i for i, q in enumerate(session["questions"]) if q["id"] == question_id), -1)
    
    if question_index == -1:
        raise RuntimeError("Questão não encontrada na sessão")

    question = session["questions"][question_index]
    correct = selected_option == question.get("correct")
    
    session["asked"].append(question_id)
    session["responses"].append(1 if correct else 0)

    # 🔹 Adicionando log de diagnóstico aqui
    logger.info(f"Usuário {user_id} submeteu resposta: '{selected_option}' para {question_id}. Correta: {correct}")

    try:
        record_answer(user_id, question_id, selected_option, correct)

        administered_indices = [next(i for i, q in enumerate(session["questions"]) if q["id"] == qid) for qid in session["asked"]]
        
        # Converte a lista de parâmetros para um array numpy
        items_array = np.array([[p["a"], p["b"], p["c"]] for p in session["item_params"]])

        # 🔹 Log de diagnóstico para a função eap_theta
        logger.info(f"Chamando eap_theta com: {len(items_array)} itens, {len(administered_indices)} índices, {len(session['responses'])} respostas.")
        
        session["theta"] = eap_theta(
            items=items_array,
            administered=administered_indices,
            responses=session["responses"],
            grid_min=-4.0,
            grid_max=4.0,
            grid_size=50
        )
    except Exception as e:
        logger.error(f"Erro no processamento da resposta do usuário {user_id}: {e}")
        raise # 🔹 Relança a exceção para que o FastAPI a capture e retorne o 500
    
    session["num_questions_asked"] += 1
    
    # 🔹 Adiciona a lógica para marcar a sessão como concluída
    if session["num_questions_asked"] >= MAX_QUESTIONS_PER_USER:
        session["completed"] = True
    
    return {
        "ok": True,
        "correct": correct,
        "theta": session["theta"],
        "questions_left": MAX_QUESTIONS_PER_USER - session["num_questions_asked"]
    }