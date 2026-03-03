# PlaceMentor AI - Deployment Guide

This guide provides step-by-step instructions for deploying the PlaceMentor AI project, including the Frontend, Main Backend, and Chatbot RAG service.

## 🏗️ Architecture Overview

The project consists of three main components:
1.  **Frontend**: React (Vite) application.
2.  **Main Backend**: FastAPI application handling authentication, data management, and integration.
3.  **Chatbot Backend**: FastAPI application specifically for RAG (Retrieval-Augmented Generation) and AI chat.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- A **Google Cloud Project** with the Google Sheets API enabled.
- A **Google Service Account** with "Viewer" access to your spreadsheet.
- A **MongoDB** database (e.g., MongoDB Atlas).
- API Keys for: **Groq**, **Pinecone**, and **Nomic**.

---

## 🚀 Step 1: Backend Deployment (Main & Chatbot)

We recommend using **Render** or **Railway** for the backends.

### 1. Main Backend (`/backend`)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Render Secret Files (Recommended)**:
    1. In your Render Dashboard, go to your Web Service settings.
    2. Click on **Environment** and find the **Secret Files** section.
    3. Click **Add Secret File**.
    4. **Filename**: `backend/placementor-ai.json` (This ensures it's placed in the correct directory).
    5. **Contents**: Paste the entire content of your `placementor-ai.json`.
- **Environment Variables**:
    - `PYTHON_VERSION`: `3.10.12` (Crucial to avoid build errors).
    - `MONGO_URI`: Your MongoDB connection string.
    - `GOOGLE_SPREADSHEET_ID`: ID of your Google Sheet.
    - `GOOGLE_SERVICE_ACCOUNT_KEY_FILE`: Path to your JSON key (see Note below).
    - `JWT_SECRET_KEY`: A long, random string for token signing.
    - `GROQ_API_KEY`: Your Groq API key.
    - `FRONTEND_URL`: The URL where your frontend will be hosted.
    - `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`: For email functionality.

> [!NOTE]
> For the Service Account JSON, it is recommended to store the **entire JSON content** as an environment variable (e.g., `GOOGLE_CREDENTIALS_JSON`) and modify the code to read from the env var instead of a file for better security on cloud platforms.

### 2. Chatbot Backend (`/chatbot`)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
    - `PYTHON_VERSION`: `3.10.12`.
    - `GROQ_API_KEY`: Your Groq API key.
    - `PINECONE_API_KEY`: Your Pinecone API key.
    - `NOMIC_API_KEY`: Your Nomic API key.

---

## 🌐 Step 2: Frontend Deployment (`/frontend`)

We recommend using **Vercel** or **Netlify**.

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
    - `VITE_API_URL`: The URL of your **Main Backend**.
    - `VITE_CHATBOT_URL`: The URL of your **Chatbot Backend**.

---

## 🔄 Step 3: CI/CD with GitHub Actions

To automate your workflow, a GitHub Actions pipeline can be configured to:
1.  Run Linting and Type Checking.
2.  Run Unit Tests.
3.  Auto-deploy to your chosen hosting provider on every push to `main`.

Refer to the `.github/workflows/main.yml` file in the repository for the automated pipeline configuration.

---

## 🛡️ Security Best Practices
- **Never** commit `.env` files or JSON credentials to Git.
- Use **Environment Secrets** in GitHub/Render/Vercel.
- Enable **CORS** only for your specific frontend domain in production.
