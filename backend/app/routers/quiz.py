# app/routers/quiz.py
from fastapi import APIRouter, HTTPException, Body
from loguru import logger
from app.cat import init_cat, get_next_question, submit_answer
from app.data_access import fetch_questions, fetch_alternatives

router = APIRouter()

# 🔹 Iniciar um novo quiz
@router.post("/start-quiz")
async def start_quiz(payload: dict):
    # aceita várias chaves comuns
    user_id = payload.get("user_id") or payload.get("userId") or payload.get("uid")
    if not user_id:
        raise HTTPException(400, "Campo 'user_id' é obrigatório no corpo da requisição.")

    try:
        # Busca todas as questões e alternativas do banco de dados
        questions_data, params_by_id = fetch_questions()
        alternatives_data = fetch_alternatives()

        ready = []
        for q in questions_data:
            pack = alternatives_data.get(q["id"])
            if not pack or not pack["options"] or not pack["correct"]:
                logger.warning(f"Questão {q['id']} sem alternativas/correta — ignorando.")
                continue
            q["options"] = pack["options"]
            q["correct"] = pack["correct"]
            ready.append(q)

        if not ready:
            raise RuntimeError("Nenhuma questão válida encontrada. Verifique alternativas e a flag 'correct'.")

        # **alinha** os parâmetros com a ordem do array `ready`
        ready_params = [params_by_id[q["id"]] for q in ready]

        # Inicializa a sessão do CAT com o banco de itens completo
        init_cat(user_id, ready, ready_params)
        
        return {"ok": True, "question": get_next_question(user_id)}
    except Exception as e:
        logger.exception("Falha em /start-quiz")
        raise HTTPException(500, f"start-quiz falhou: {e}")


# 🔹 Buscar próxima questão adaptativa
@router.get("/next-question")
async def next_question(user_id: str):
    try:
        question = get_next_question(user_id)
        
        # Se não houver mais questões, sinaliza o fim do teste
        if not question:
            # A sessão é mantida em memória, então podemos pegar o theta final
            from app.cat import user_sessions
            session = user_sessions.get(user_id, {})
            return {"finished": True, "theta": session.get("theta", 0.0)}

        return {"question": question}

    except RuntimeError as e:
        # Captura o erro se a sessão não for encontrada
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
