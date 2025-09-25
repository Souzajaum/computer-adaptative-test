# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.quiz import router as quiz_router

application = FastAPI()

origins = ["https://computer-adaptative-test-7.vercel.app"]

application.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

application.include_router(quiz_router, prefix="/api", tags=["quiz"])
