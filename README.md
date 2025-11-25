# PlaceMentor AI  
### Smart Career & Placement Companion 🎓🤖


## Overview / Introduction  
**PlaceMentor AI** is a full-stack, AI-driven platform designed for deep, data-backed insights into university placement trends, backed by **real placement data from the IT Department of your university**. It guides students, faculty, and placement cells through intelligent dashboards, predictive analytics, and a conversational AI assistant — making career decisions smart, strategic, and evidence-based.

---

## What the Website Does  
- Ingests and processes authentic placement data (student records, recruiters, compensation)  
- Provides interactive analytics dashboards: placement rates, package distributions, trends by department or batch  
- Offers a **chat-based AI companion** (floating chatbot) that answers placement- and career-related queries  
- Helps students build resumes with built-in resume builder & competency test modules  
- Supports predictive analytics to forecast placement trends, hiring behavior, and student outcomes  

---

## Why It Is Important  
Placements are a critical milestone in a student’s career journey, but existing systems often rely on fragmented spreadsheets or outdated reports. By combining **real university data** with AI and analytics, PlaceMentor AI empowers stakeholders to make better decisions — whether it's for departmental strategy, student preparation, or recruiter engagement.

---

## What Problem It Solves  
- Eliminates the chaos of siloed placement data  
- Offers a **single source of truth** for placement statistics and insights  
- Reduces manual effort for placement cells in generating reports  
- Answers complex placement-related questions on demand via AI  
- Helps students understand their career trajectories and opportunities better  

---

## Emphasis: Authentic University Placement Data  
This platform’s foundation is **genuine placement data** obtained from the **IT Department** of the university — not synthetic samples or scraped data. This authenticity ensures that all insights, predictions, and analytics are grounded in real-world outcomes.

---

## Key Features  
- 📊 **Data-driven Dashboards**: Visualize placement by department, batch, role, salary, and more  
- 🤖 **AI Chat Companion**: Ask natural-language questions about placements, companies, packages  
- 📈 **Trend Analytics & Forecasting**: Predict hiring trends, department performance, and student outcomes  
- 🧪 **Competency Tests**: Internally assess students’ skills and readiness  
- 🧾 **Resume Builder**: Build, edit, export professional resumes right in the app  
- 🔐 **Role-based Access**: Different views for students, faculty, and admins  
- 🔍 **Searchable Company Directory**: Filter companies by location, package, and other criteria  

---

## Tech Stack  
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + framer-motion  
- **Backend**: Python, FastAPI :contentReference[oaicite:0]{index=0}  
- **AI / RAG Pipeline**: LangChain, Sentence Transformers, ChromaDB  
- **Database / Storage**: Vector DB (Chroma), relational DB (if used)  
- **Authentication**: JWT, OTP-based email verification  
- **Dev Workflow**: (if applicable) GitHub Actions, Docker  
- **Hosting / Deployment**: (adjust with your stack)  

---

## System Architecture Summary  
1. **Data Ingestion**: PDF, Excel, Google Sheets / Drive integration  
2. **Anonymization**: Sensitive student data is sanitized  
3. **Embedding & Indexing**: Cleaned data converted to embeddings & stored in ChromaDB  
4. **Retrieval + Generation**: Chat queries trigger RAG pipeline (LangChain) → LLM  
5. **API Layer**: FastAPI serves backend APIs (analytics, chat, user management)  
6. **Frontend**: React UI with dashboards, chatbot, and utility modules  
7. **Auth Layer**: Role-based auth for students, faculty, admins  

---


## How to Run Locally  

```bash
# Clone the repo  
git clone https://github.com/git112/SGP--5.git  
cd SGP--5  

# Backend setup  
cd backend  
python3 -m venv venv  
source venv/bin/activate  
pip install -r requirements.txt  
# Create / configure .env (for DB, JWT, etc.)  
uvicorn main:app --reload  

# Frontend setup  
cd ../frontend  
npm install  
npm run dev  

# Visit:  
# Frontend → http://localhost:5173 (or your Vite port)  
# API docs → http://127.0.0.1:8000/docs  
