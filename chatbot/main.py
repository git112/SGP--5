from dotenv import load_dotenv
load_dotenv()
import logging
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from rag.pipeline import RAGPipeline


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
pipeline = None

class QueryRequest(BaseModel):
    query: str
    stream: bool = True

@app.on_event("startup")
async def startup_event():
    global pipeline
    try:
        logger.info("Checking environment variables...")
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        load_dotenv(dotenv_path=env_path)
        
        key = os.getenv("GROQ_API_KEY")
        if not key:
            logger.error(f"GROQ_API_KEY not found in environment at {env_path}")
        else:
            logger.info(f"GROQ_API_KEY found (length: {len(key)})")
            
        logger.info("Initializing RAG Pipeline...")
        pipeline = RAGPipeline()
        logger.info("RAG Pipeline initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize RAG Pipeline: {e}")

@app.post("/chat")
async def chat(request: QueryRequest):
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline not ready")
    
    try:
        if request.stream:
            # Note: backend/main.py expects certain SSE format
            return StreamingResponse(
                pipeline.stream_answer(request.query),
                media_type="text/event-stream"
            )
        else:
            return pipeline.answer(request.query)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stream")
async def chat_stream(request: QueryRequest):
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline not ready")
    return StreamingResponse(
        pipeline.stream_answer(request.query),
        media_type="text/event-stream"
    )

@app.get("/health")
async def health():
    if not pipeline:
        return {"status": "initializing", "pinecone": "unknown"}
    return {
        "status": "ok",
        "pinecone": "connected",
        "bm25_chunks": len(pipeline.retriever.chunks)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)