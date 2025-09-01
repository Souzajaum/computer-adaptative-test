@echo off
SETLOCAL

REM ---- 1. Criar virtualenv se não existir ----
IF NOT EXIST ".venv\Scripts\activate" (
    echo Criando virtualenv...
    python -m venv .venv
)

REM ---- 2. Ativar virtualenv ----
call .venv\Scripts\activate

REM ---- 3. Atualizar pip ----
echo Atualizando pip...
python -m pip install --upgrade pip

REM ---- 4. Instalar dependências ----
echo Instalando dependências...
pip install fastapi uvicorn catsim python-dotenv supabase

REM ---- 5. Rodar o servidor FastAPI ----
echo Iniciando servidor FastAPI...
uvicorn app.main:app --reload

ENDLOCAL
