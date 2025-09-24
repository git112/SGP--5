# 🚀 PlaceMentor AI
### Your Smart Career & Placement Companion

Navigating the world of university placements can be a maze of scattered spreadsheets, outdated documents, and unanswered questions. **PlaceMentor AI** transforms this chaos into clarity. It’s a full-stack, intelligent platform designed to empower students and faculty with instant, data-driven insights and a personalized AI assistant for every step of the career journey.

---
## ✨ A Feature Showcase

PlaceMentor AI is more than just a chatbot; it's a comprehensive suite of tools designed to give you a competitive edge.

### For the Ambitious Student
* **AI Interview Coach:** Practice and prepare for technical interviews with an AI assistant that guides you through common questions and scenarios.
* **Competency Tests:** Sharpen your skills with built-in assessments to identify your strengths and areas for improvement.
* **Modern Resume Builder:** Craft a standout, professional resume in minutes with a sleek, form-driven builder that exports to PDF.

### For the Data-Driven Analyst
* **Interactive Insights Dashboard:** Dive deep into placement statistics with beautiful, animated charts. Analyze CGPA vs. offer trends, hiring distributions, and yearly package stats, all powered by live Google Sheets data.
* **Dynamic Company Directory:** Explore and search for companies with powerful filters for location and compensation. Animated cards make discovering opportunities an engaging experience.

### Your Ever-Present AI Companion
* **Floating Chatbot:** The heart of PlaceMentor AI. An elegant, streaming chat interface, always available to answer your toughest questions—from "What was the highest package in 2023?" to "What skills are needed for a Security Analyst role?"

---
## 🧠 The Magic Behind the Curtain

We combined cutting-edge frontend technologies with a powerful, AI-driven backend to create a seamless experience.

### The User Experience
The frontend is a blazing-fast **React 18** and **TypeScript** application, built with **Vite**. The entire interface is styled with **TailwindCSS**, creating a clean, modern, and fully responsive design. All animations, from the smooth "reveal-on-scroll" effects to the fluid transitions of the chatbot, are powered by **framer-motion**, making the platform a joy to use.

### The Backend Powerhouse
The backend is a robust and scalable API built with **FastAPI**. It handles everything from secure user authentication with **JWT** and **OTP** email verification to orchestrating the complex AI pipeline.

### The RAG Pipeline
The chatbot's intelligence comes from a state-of-the-art Retrieval-Augmented Generation (RAG) system:
1.  **Ingestion:** It reads and merges data from a variety of sources, including local PDFs, Excel files, and Google Drive/Sheets.
2.  **Anonymization:** It automatically redacts all personal information to ensure student privacy.
3.  **Embedding & Storage:** The clean data is converted into vectors by **Sentence Transformers** and stored in a local **ChromaDB** vector database.
4.  **Retrieval & Generation:** When you ask a question, **LangChain** orchestrates the process of finding the most relevant information and sends it to a powerful Large Language Model to generate a stunningly accurate, data-grounded answer.

---
## 🗂️ Project Structure

The codebase is cleanly separated between the frontend and backend, ensuring maintainability and scalability.

```txt
.
├─ backend/
│  ├─ data/         # Spreadsheets & artifacts for RAG
│  ├─ signup/       # Authentication, OTP, and JWT logic
│  ├─ vector_db/    # Local ChromaDB index files
│  └─ main.py       # FastAPI application entry point
│
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/ # Reusable UI components (chatbot, etc.)
│  │  ├─ hooks/      # Custom React hooks (e.g., scroll animation)
│  │  ├─ pages/      # All application pages (Insights, Resume Builder)
│  │  └─ main.tsx    # React application entry point
└─ README.md
---
```

## ✨ The Journey

PlaceMentor AI represents a leap forward in how we interact with career data. By blending a beautiful user interface with a powerful, privacy-focused AI, it provides a tool that is not only useful but inspiring. It’s a testament to the idea that with the right technology, any student can be empowered to make smarter, more informed decisions about their future.

Thank you for exploring this project!
