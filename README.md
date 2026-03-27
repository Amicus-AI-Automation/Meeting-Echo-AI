
# Meeting-Echo-AI (MeetingRAG)

Unified platform for meeting audio upload, transcription, semantic search, and chat, with a Node.js/Express backend, Python API for AI features, and a React frontend with Microsoft Entra ID authentication.

---

## Project Structure

```
Meeting-Echo-AI/
├── backend/           # Node.js/Express API, MongoDB, JSON storage, Python API integration
│   ├── python_api/    # FastAPI Python service for audio, transcription, embeddings
│   ├── ...            # Controllers, routes, models, services, uploads, etc.
├── frontend/          # React app (MSAL/Entra ID, chat, dashboard, upload)
│   ├── src/
│   │   ├── components/  # ChatUI, Sidebar, UploadMeeting, etc.
│   │   ├── pages/       # Dashboard, LoginPage
│   │   ├── services/    # api.js (API integration)
│   │   └── App.js
│   └── ...
├── requirements_python.txt  # Python dependencies for backend/python_api
└── ...
```

---

## Backend Setup

### 1. Environment Variables
Copy `backend/README.md`'s .env template and fill in:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meeting-rag
JWT_SECRET=your_super_secret_jwt_key
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
CORS_ORIGIN=http://localhost:3000
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. MongoDB Setup
- Local: Install MongoDB and run on default port
- Atlas: Use your connection string in `MONGODB_URI`

### 4. Start Backend
```bash
node server.js
# or use: npm start
```

### 5. Python API Setup
```bash
cd backend/python_api
# Create venv and activate (Windows):
python -m venv venv
venv\Scripts\activate
# Install requirements:
pip install -r ../../requirements_python.txt
# Start API:
uvicorn main:app --reload --port 8000
```

---

## Frontend Setup

### 1. Environment Variables
Configure MSAL/Entra ID in `frontend/src/authConfig.js` and `.env` if needed.

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start Frontend
```bash
npm start
# App runs at http://localhost:3000
```

---

## Code Functionality

### Backend (Node.js/Express)
- **server.js**: Entry point, connects to MongoDB, sets up Express, CORS, health check, and meeting routes.
- **controllers/meetingController.js**: Handles meeting CRUD, file upload, triggers Python API for transcription/embedding.
- **routes/meeting.js**: API endpoints for meetings (upload, list, search, chat).
- **models/**: Mongoose schemas for Meeting and User.
- **services/jsonStorage.js**: Reads/writes meeting data to JSON files.
- **python_api/**: FastAPI app for audio extraction, transcription (Whisper), embeddings (sentence-transformers), vector DB (ChromaDB).

**Typical flow:**
1. User uploads meeting audio via frontend.
2. Backend saves file, calls Python API for transcription/embedding.
3. Data stored in MongoDB and/or JSON files.
4. User can search or chat with meeting content via API.

### Frontend (React)
- **src/App.js**: Handles authentication (MSAL/Entra ID), routes to LoginPage or Dashboard.
- **src/pages/**: `LoginPage.js` (login UI), `Dashboard.js` (main app UI).
- **src/components/**: `ChatUI.js` (chat interface), `Sidebar.js` (meeting list), `UploadMeeting.js` (file upload).
- **src/services/api.js**: Handles API requests to backend.

**Typical flow:**
1. User logs in with Microsoft account.
2. Uploads meeting audio, sees list of meetings.
3. Can chat with meeting content (semantic search, Q&A).

---

## Example API Usage

**Health Check:**
```
GET http://localhost:5000/health
```

**Upload Meeting:**
```
POST http://localhost:5000/api/meetings/upload
Content-Type: multipart/form-data
Body: { audio file }
```

**Chat/Search:**
```
POST http://localhost:5000/api/meetings/chat
Body: { meetingId, question }
```


## License

MIT

