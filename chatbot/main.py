import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import json

# This imports from rag_service.py (in this same folder)
try:
    from rag_service import rag_service
except Exception as e:
    logging.critical(f"Failed to import rag_service: {e}")
    rag_service = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow your main app to call this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.post("/chat")
async def chat_with_bot(request: QueryRequest):
    if not rag_service:
        raise HTTPException(status_code=500, detail="RAG Service not initialized")
    try:
        response = rag_service.process_query(request.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stream")
async def chat_with_bot_stream(request: QueryRequest):
    if not rag_service:
        raise HTTPException(status_code=500, detail="RAG Service not initialized")
    
    try:
        def generate_stream():
            try:
                for chunk in rag_service.process_query_stream(request.query):
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return EventSourceResponse(generate_stream())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reload")
async def reload_knowledge_base():
    if not rag_service:
        raise HTTPException(status_code=500, detail="RAG Service not initialized")
    try:
        result = rag_service.reload_knowledge_base()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # We will run this on port 8001 to keep it separate
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)