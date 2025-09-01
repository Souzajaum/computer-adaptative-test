# app/routers/quiz.py
from fastapi import APIRouter, HTTPException
from app.db import get_client
from app.cat import init_cat, get_next_question, submit_answer
from app.data_access import fetch_questions, fetch_alternatives

router = APIRouter()

# 🔹 Buscar próxima questão adaptativa
@router.get("/next-question")
async def next_question(user_id: str):
    client = get_client()

    try:
        # 1️⃣ Busca todas as questões e alternativas
        questions_data = fetch_questions()
        alternatives_data = fetch_alternatives()

        # 2️⃣ Inicializa sessão adaptativa
        session = init_cat(user_id, questions_data, alternatives_data)

        # 3️⃣ Pega próxima questão
        question = get_next_question(user_id)
        if not question:
            # Fim do teste
            return {"message": "Teste concluído", "theta": session["theta"]}

        return question

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
