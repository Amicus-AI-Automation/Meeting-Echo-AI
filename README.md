# MeetingRAG - Meeting Intelligence Assistant

A full-stack web application that enables users to upload meeting recordings and ask intelligent questions about them using a Chat UI. Built with React 19 frontend and Node.js/Express backend, secured with **Azure Entra ID (Microsoft SSO)** and role-based access control.

## 📋 Features

- **Azure Entra ID Authentication** - Microsoft SSO login via MSAL (no passwords required)
- **Role-Based Access Control** - Admin and User roles; Admins upload, Users view
- **Meeting Upload** - Admins upload meeting files (MP4, WAV, MP3, up to 500MB) with participant info
- **Participant Access Control** - Meetings visible only to assigned participants
- **Chat Interface** - Ask questions about uploaded meetings
- **JSON File Storage** - Lightweight persistence without a database dependency
- **JWT Token Validation** - Backend verifies Azure-issued ID tokens via JWKS endpoint

## 📁 Project Structure

```
MeetingRAG/
├── frontend/                     # React 19 application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatUI.js         # Chat interface for querying meetings
│   │   │   ├── ChatUI.css
│   │   │   ├── Sidebar.js        # Navigation sidebar with role badge & upload button
│   │   │   ├── Sidebar.css
│   │   │   ├── UploadMeeting.js  # Meeting file upload form (Admin only)
│   │   │   └── UploadMeeting.css
│   │   ├── pages/
│   │   │   ├── LoginPage.js      # Role selection + Microsoft SSO login
│   │   │   ├── LoginPage.css
│   │   │   ├── Dashboard.js      # Main app shell after authentication
│   │   │   └── Dashboard.css
│   │   ├── services/
│   │   │   └── api.js            # Axios instance with auth + role headers
│   │   ├── authConfig.js         # MSAL PublicClientApplication config
│   │   ├── App.js                # Root with MsalProvider + auth routing
│   │   └── index.js
│   ├── package.json
│   └── .env                      # REACT_APP_AZURE_TENANT_ID, REACT_APP_AZURE_CLIENT_ID
│
└── backend/                      # Express.js API (port 5000)
    ├── controllers/
    │   ├── authController.js     # OTP auth (legacy, kept for reference)
    │   └── meetingController.js  # Upload, list, query meetings
    ├── middleware/
    │   ├── auth.js               # Legacy JWT middleware
    │   └── entraAuth.js          # Azure Entra ID token validation via JWKS
    ├── routes/
    │   ├── auth.js               # /send-otp, /verify-otp (legacy)
    │   └── meeting.js            # /upload-meeting, /meetings, /query
    ├── services/
    │   └── jsonStorage.js        # JSON file persistence layer
    ├── config/
    │   ├── mongodb.js            # MongoDB config (not actively used)
    │   └── email.js              # Nodemailer config
    ├── data/                     # JSON data files (meetings, users)
    ├── uploads/                  # Uploaded meeting files
    ├── server.js                 # Express entry point, CORS, routes
    ├── package.json
    └── .env                      # AZURE_TENANT_ID, AZURE_CLIENT_ID
```

## 🔐 Authentication Architecture

Authentication uses **Azure Entra ID (Microsoft SSO)** with the MSAL library. No passwords or OTPs are required.

### Login Flow
1. User opens the app → lands on **LoginPage**
2. User selects role: **Admin** or **User**
3. App calls `instance.loginPopup()` → Microsoft sign-in popup opens
4. After sign-in, app calls `acquireTokenSilent()` to get the ID token
5. `idToken`, `userEmail`, and `userRole` are saved to `localStorage`
6. App detects the token in localStorage → redirects to **Dashboard**

### Token Validation (Backend)
- Every API request includes `Authorization: Bearer <idToken>` and `X-User-Role: admin|user` headers
- Backend fetches Microsoft's JWKS public keys (`login.microsoftonline.com/<tenant>/discovery/v2.0/keys`)
- Token is verified with RS256 signature using `jwk-to-pem` for JWK → PEM conversion
- JWKS keys are cached for 1 hour to avoid repeated fetches

### Role-Based Access
| Role | Permissions |
|------|------------|
| Admin | Upload meetings, view all meetings, query meetings |
| User | View meetings they are a participant of, query meetings |

The role is sent from the frontend via `X-User-Role` header. The backend accepts it if the Entra ID token is valid.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- An **Azure Entra ID** (formerly Azure AD) app registration

### 1. Azure App Registration

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **New registration**
3. Name: `MeetingRAG` | Account type: Single tenant (or multi-tenant as needed)
4. Redirect URI: **Single-page application (SPA)** → `http://localhost:3000`
5. After creation, note your **Application (client) ID** and **Directory (tenant) ID**
6. Under **Authentication**, ensure `Access tokens` and `ID tokens` are both checked

### 2. Configure Environment Variables

**Backend** — create `backend/.env`:
```env
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
PORT=5000
```

**Frontend** — create `frontend/.env`:
```env
REACT_APP_AZURE_TENANT_ID=your-tenant-id
REACT_APP_AZURE_CLIENT_ID=your-client-id
REACT_APP_API_URL=http://localhost:5000
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Start Servers

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

## 🔄 User Flow

1. **Login** → Click **Admin** or **User** → Sign in with Microsoft account
2. **Dashboard** → See role badge in the sidebar (👨‍💼 Admin / 👤 User)
3. **Upload Meeting** *(Admin only)* → Click Upload → Fill name, add participants, attach file
4. **View Meetings** → Listed in sidebar; participants see only their meetings
5. **Query** → Ask a question in the Chat UI → Get an answer from the backend

## 📡 API Endpoints

All endpoints (except legacy auth) require:
- `Authorization: Bearer <idToken>`
- `X-User-Role: admin` or `X-User-Role: user`

### Meetings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/upload-meeting` | Admin only | Upload meeting file + metadata |
| GET | `/meetings` | All authenticated | List meetings for this user |
| POST | `/query` | All authenticated | Ask a question about meetings |

### Legacy Auth (kept for reference)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send-otp` | Send OTP to email |
| POST | `/verify-otp` | Verify OTP and get JWT |

## 🧪 Testing the Application

### Test Admin Upload
1. Open `http://localhost:3000`
2. Click **Admin** → sign in with your Microsoft account
3. Dashboard shows `👨‍💼 Admin` badge in sidebar
4. Click **Upload Meeting** → fill in details and upload a file
5. Meeting appears in the list

### Test User Access
1. Log out and click **User** → sign in
2. Dashboard shows `👤 User` badge — no upload button
3. Only meetings where you are listed as a participant are visible

### Test Chat
1. Select a meeting from the sidebar
2. Type a question in the Chat UI
3. Backend returns a response

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Axios |
| Auth (frontend) | @azure/msal-browser v3, @azure/msal-react v2 |
| Backend | Node.js, Express.js |
| Auth (backend) | jsonwebtoken, jwk-to-pem, axios (JWKS fetch) |
| Storage | JSON files (via jsonStorage service) |
| File uploads | Multer (500 MB limit, MP4/WAV/MP3) |

## ⚙️ Key Configuration Notes

- **JWKS caching**: Public keys are cached in memory for 1 hour (`entraAuth.js`)
- **File size limit**: 500 MB per upload (configurable in `routes/meeting.js`)
- **Accepted formats**: `.mp4`, `.wav`, `.mp3`
- **Storage path**: `backend/data/` for JSON, `backend/uploads/` for files
- **CORS**: Configured for `http://localhost:3000` and `http://localhost:3001`

### Troubleshooting

**MongoDB Connection Failed**
- Check if MongoDB is running: `mongod`
- Verify `MONGODB_URI` format
- Check firewall/VPN blocks

**Email Not Sending**
- Verify Gmail app password (not regular password)
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Enable "Less secure app access" or use App Passwords

**CORS Errors**
- Ensure `CORS_ORIGIN=http://localhost:3000` in backend `.env`
- Frontend and backend running on correct ports

**Port Already in Use**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

## 📝 MongoDB Schema

### User Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "isVerified": true,
  "otp": {
    "code": null,
    "expiresAt": null
  },
  "meetings": [ObjectId],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Meeting Collection
```json
{
  "_id": ObjectId,
  "meeting_id": "M12345678",
  "meeting_name": "Salary Discussion",
  "file_path": "/uploads/meeting.mp4",
  "file_name": "meeting.mp4",
  "file_size": 52428800,
  "participants": [
    {
      "email": "user1@company.com",
      "id": "uuid-123"
    }
  ],
  "created_by": ObjectId,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

## 🔒 Security

- **JWT Authentication** - 7-day expiry
- **Email OTP** - 10-minute expiry, 1-minute rate limit
- **Password Validation** - Email format checking
- **File Upload Validation** - Type and size limits
- **CORS Protection** - Whitelist frontend origin
- **Error Handling** - Generic error messages to prevent info leakage

## 🚀 Production Deployment

### Frontend (Vercel, Netlify)
```bash
npm run build
# Deploy build/ folder
```

### Backend (Heroku, Railway, Render)
```bash
# Set environment variables in hosting platform
# Push code to git → Auto-deploy
```

## 📦 Dependencies

**Frontend**
- React 19
- Axios
- React Router
- UUID

**Backend**
- Express.js
- Mongoose
- JWT
- Multer (file uploads)
- Nodemailer (emails)

## 📄 License

ISC

---

For detailed backend setup, see [backend/README.md](backend/README.md)
