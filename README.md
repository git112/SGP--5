# PlaceMentor AI - RAG-Based Placement Chatbot

A comprehensive AI-powered chatbot system for university placement websites, built with FastAPI backend and React frontend, featuring Retrieval-Augmented Generation (RAG) capabilities.

## 🚀 Features

- **Intelligent Chatbot**: AI-powered assistant for placement-related queries
- **Google Drive Integration**: Reads data directly from Google Drive
- **RAG System**: Retrieval-Augmented Generation using in-memory vector search
- **Real-time Responses**: Instant answers based on placement data
- **Floating UI**: Modern, responsive chat interface
- **Local Processing**: No external API costs for core functionality (embeddings only)
- **Extensible**: Easy to add new data sources and models

## 🏗️ Project Structure

```
govcheck-ai/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main FastAPI application with chatbot endpoint
│   ├── simple_rag_service.py  # Google Drive-based RAG service
│   ├── drive_service.py    # Google Drive API integration
│   ├── sheets_service.py   # Google Sheets service (existing)
│   ├── requirements.txt    # Python dependencies
│   └── placementor-ai.json # Google service account credentials
├── frontend/               # React frontend
│   └── src/components/
│       ├── PlacementChatbot.tsx  # Main chatbot component
│       └── FloatingBot.tsx       # Floating bot wrapper
├── data/                   # Sample data files (for local testing)
│   ├── placements.xlsx     # Student placement data
│   ├── companies.xlsx      # Company information
│   └── interviews.xlsx     # Interview questions
├── GOOGLE_DRIVE_SETUP.md   # Google Drive integration guide
└── README.md               # This file
```

## 🛠️ Prerequisites

### Backend Requirements
- Python 3.8+
- pip or conda

### Frontend Requirements
- Node.js 16+
- npm or yarn
- React 18+

## 📦 Installation & Setup

### 1. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

 

#### Google Drive Setup
1. **Follow the detailed guide**: See `GOOGLE_DRIVE_SETUP.md` for complete setup instructions
2. **Quick setup**:
   - Create a Google Cloud project and enable Drive API
   - Create a service account and download credentials as `placementor-ai.json`
   - Place the file in your `backend/` directory
   - Create a Google Drive folder with your CSV files
   - Set the folder ID in your `.env` file

The system will automatically:
- Connect to Google Drive using your service account
- Download and process CSV files from the specified folder
- Generate natural language summaries
- Create vector embeddings for similarity search

#### Start the Backend Server
```bash
cd backend
python main.py
```

The server will start on `http://localhost:8000`

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Backend/.env
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here  # Google Drive folder containing CSV files
```

## 🚀 Usage

### Starting the System

1. **Start Backend**:
   ```bash
   cd backend
   python main.py
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Using the Chatbot

1. Navigate to your website
2. Look for the floating chat icon in the bottom-right corner
3. Click to open the chat interface
4. Ask questions about:
   - Student placements
   - Company information
   - Interview questions
   - CGPA requirements
   - Salary packages

### Example Queries

- "What companies hire students with CGPA above 8.5?"
- "Tell me about Google's placement offers"
- "What technical questions does Amazon ask for Cloud Engineer role?"
- "How many students were placed in 2024?"
- "What's the average package for Software Engineer roles?"

## 🔍 How It Works

### RAG Pipeline

1. **Query Processing**: User question is received
2. **Embedding Generation**: Question is converted to vector using sentence-transformers
3. **Similarity Search**: ChromaDB finds most relevant context chunks
4. **Context Retrieval**: Top 3 most similar text chunks are retrieved
5. **Prompt Construction**: Context and question are combined into a prompt
6. **Rule-based Generation**: A simple template-based response is generated (no LLM)
7. **Response Delivery**: Answer is sent back to the user

### Data Flow

```
Google Drive → CSV Files → Text Summaries → Vector Embeddings → In-Memory Storage
                                                                    ↓
User Query → Vector Embedding → Similarity Search → Context Retrieval
                                                                    ↓
Template Prompt → Response → User
```

## 🧪 Testing

### Test the Chatbot API

```bash
curl -X POST "http://localhost:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"query": "What companies hire students with CGPA above 8.5?"}'
```

### Test Data Ingestion

```bash
cd backend
python ingest.py
```
