# app/routers/quiz.py
from fastapi import APIRouter, HTTPException, Body
from loguru import logger
from app.cat import init_cat, get_next_question, submit_answer, MAX_QUESTIONS_PER_USER
from app.data_access import fetch_questions, fetch_raw_alternatives, check_user_completion

router = APIRouter()

# 🔹 Iniciar um novo quiz
@router.post("/start-quiz")
async def start_quiz(payload: dict):
    # aceita várias chaves comuns
    user_id = payload.get("user_id") or payload.get("userId") or payload.get("uid")
    if not user_id:
        raise HTTPException(400, "Campo 'user_id' é obrigatório no corpo da requisição.")

    try:
        # 🔹 Implementa a nova regra de bloqueio: verifica se o usuário já completou o quiz
        if check_user_completion(user_id, MAX_QUESTIONS_PER_USER):
            raise HTTPException(403, "Você já concluiu este quiz.")

        # Busca todas as questões e alternativas do banco de dados
        questions_data, _ = fetch_questions()
        alternatives_data = fetch_raw_alternatives()

        if not questions_data or not alternatives_data:
            raise RuntimeError("Nenhuma questão ou alternativa encontrada no banco de dados.")

        # Inicializa a sessão do CAT com os dados brutos. A lógica de processamento
        # está centralizada na função `init_cat` em `cat.py`
        init_cat(user_id, questions_data, alternatives_data)
        
        return {"ok": True, "question": get_next_question(user_id)}
    except HTTPException as e:
        # Relança a exceção HTTP para que o FastAPI a capture
        raise e
    except Exception as e:
        logger.exception("Falha em /start-quiz")
        raise HTTPException(500, f"start-quiz falhou: {e}")


# 🔹 Buscar próxima questão adaptativa
@router.get("/next-question")
async def next_question(user_id: str):
    try:
        question = get_next_question(user_id)
        
        if not question:
            from app.cat import user_sessions
            session = user_sessions.get(user_id, {})
            return {"finished": True, "theta": session.get("theta", 0.0)}

        return {"question": question}

    except RuntimeError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔹 Submeter resposta do usuário
@router.post("/submit-answer")
async def submit_answer_endpoint(payload: dict):
    user_id = payload.get("user_id")
    question_id = payload.get("question_id")
    answer_option = payload.get("answer")
    
    if not user_id or not question_id or not answer_option:
        raise HTTPException(status_code=422, detail="Campos obrigatórios faltando")
    
    try:
        result = submit_answer(user_id, question_id, answer_option)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))