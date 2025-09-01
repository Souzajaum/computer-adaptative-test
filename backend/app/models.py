from pydantic import BaseModel
from typing import List, Dict

class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    parameters: Dict[str, float]
