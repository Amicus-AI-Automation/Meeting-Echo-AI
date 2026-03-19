from pydantic import BaseModel

class ProcessRequest(BaseModel):
    meeting_id: str
    file_path: str
    metadata: dict

class ChatRequest(BaseModel):
    meeting_id: str
    query: str
    user_email: str

class ProcessStatus(BaseModel):
    meeting_id: str
    status: str
    message: str
