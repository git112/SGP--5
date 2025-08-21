# PlaceMentor AI - RAG-Based Placement Chatbot

A comprehensive AI-powered chatbot system for university placement websites, built with FastAPI backend and React frontend, featuring Retrieval-Augmented Generation (RAG) capabilities.

## 🚀 Features

- **Intelligent Chatbot**: AI-powered assistant for placement-related queries
- **Google Drive Integration**: Reads data directly from Google Drive
- **RAG System**: Retrieval-Augmented Generation using in-memory vector search
- **Real-time Responses**: Instant answers based on placement data
- **Floating UI**: Modern, responsive chat interface
- **Local Processing**: No external API costs for core functionality
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
- Ollama (for local LLM inference)

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

#### Install Ollama (for local LLM)
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download

# Pull a model
ollama pull llama3
# or
ollama pull mistral
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
USE_OLLAMA=true                    # Use local Ollama (true) or external API (false)
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here  # Google Drive folder containing CSV files
LLM_API_KEY=your_api_key_here     # Required if USE_OLLAMA=false
LLM_API_BASE=https://api.openai.com/v1  # API base URL for external services
```

### Data Format

The system expects three Excel (.xlsx) or CSV files with specific columns:

#### placements.csv
- `StudentID`: Unique student identifier
- `Gender`: Student gender
- `CGPA`: Cumulative GPA
- `CompanyName`: Company where placed
- `Role`: Job role/position
- `Placed`: Boolean indicating placement status
- `PackageLPA`: Salary package in LPA
- `PlacementYear`: Year of placement

#### companies.csv
- `CompanyName`: Company name
- `Offers`: Number of offers made
- `PackageLPA`: Average package in LPA
- `Location`: Company location

#### interviews.csv
- `CompanyName`: Company name
- `Role`: Job role
- `PlacementYear`: Year of interview
- `QuestionType`: Type of question (Technical, Behavioral, etc.)
- `QuestionText`: Actual interview question

## 🚀 Usage

### Starting the System

1. **Start Ollama** (if using local LLM):
   ```bash
   ollama serve
   ```

2. **Start Backend**:
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
6. **LLM Generation**: Local Ollama model generates the final answer
7. **Response Delivery**: Answer is sent back to the user

### Data Flow

```
Google Drive → CSV Files → Text Summaries → Vector Embeddings → In-Memory Storage
                                                                    ↓
User Query → Vector Embedding → Similarity Search → Context Retrieval
                                                                    ↓
LLM Prompt → Ollama → Response → User
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

Check the `db/` directory for the created ChromaDB collection.

## 🚨 Troubleshooting

### Common Issues

1. **Ollama Connection Error**:
   - Ensure Ollama is running: `ollama serve`
   - Check if models are downloaded: `ollama list`

2. **ChromaDB Error**:
   - Delete the `db/` directory and re-run `ingest.py`
   - Check if CSV files are in the correct format

3. **Import Errors**:
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python version compatibility

4. **Frontend Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check React version compatibility

### Logs

Check backend logs for detailed error information. The system logs:
- Data ingestion progress
- RAG processing steps
- LLM interactions
- Error details

## 🔮 Future Enhancements

- [ ] Support for more data sources (databases, APIs)
- [ ] Advanced filtering and search capabilities
- [ ] User authentication and chat history
- [ ] Multi-language support
- [ ] Integration with external LLM APIs
- [ ] Real-time data updates
- [ ] Analytics and insights dashboard

## 📚 API Documentation

### POST /api/chat

**Request Body:**
```json
{
  "query": "Your question here"
}
```

**Response:**
```json
{
  "answer": "AI-generated response based on retrieved context"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs for error details

---

**Note**: This system is designed for educational and development purposes. Ensure you have proper data privacy and security measures in place when deploying to production.

