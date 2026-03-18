# 🚀 Complete Setup Guide - MeetingRAG

Follow this step-by-step guide to get the entire application running locally.

## ⚙️ Part 1: Initial Setup

### Step 1: Install Dependencies

**Backend Setup**
```bash
cd backend
npm install

# Expected: 8-10 packages installed (express, mongoose, nodemailer, etc.)
```

**Frontend Setup**
```bash
cd frontend
npm install

# Expected: 20+ packages installed (react, axios, react-router-dom, etc.)
```

### Step 2: Configure Environment Variables

**Backend Configuration**
```bash
cd backend

# Edit .env file (already created with defaults)
# Required changes:

# 1. MongoDB URI - Choose one:
#    Option A - Local: mongodb://localhost:27017/meeting-rag
#    Option B - Atlas: mongodb+srv://username:password@cluster.mongodb.net/meeting-rag

# 2. Email Credentials (for Gmail):
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password_16_chars

# 3. Optional:
JWT_SECRET=change_this_to_something_secure
CORS_ORIGIN=http://localhost:3000
```

**Frontend Configuration**
```bash
cd frontend

# Already configured in .env:
REACT_APP_API_URL=http://localhost:5000

# No changes needed if backend runs on port 5000
```

### Step 3: Configure MongoDB

#### Option A: Local MongoDB (Simplest for Development)

**Windows with MongoDB installed:**
```bash
# Start MongoDB service
# It will run on mongodb://localhost:27017 by default

# Verify connection:
mongo
# Should show MongoDB shell
# Exit with: exit()
```

**If MongoDB not installed:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Run installer and follow prompts
# Service starts automatically
```

#### Option B: MongoDB Atlas (Recommended for Remote Access)

```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free account)
3. Create Organization → Project → Cluster
4. Choose provider (AWS) → Region (closest to you) → M0 (Free)
5. Create cluster (takes ~3 minutes)
6. Click "Connect" → "Connect your application"
7. Copy connection string: mongodb+srv://username:password@cluster.mongodb.net/database
8. Update: backend/.env MONGODB_URI=<connection-string>
9. Replace <username> and <password> with your cluster credentials
```

### Step 4: Configure Gmail for OTP Emails

**Google Account Setup:**
```
1. Go to: https://myaccount.google.com
2. Click "Security" (left sidebar)
3. Enable "2-Step Verification" (if not already enabled)
4. Search for "App passwords"
5. Select: Mail → Windows Computer
6. Google generates 16-character password (without spaces)
7. Copy the password
```

**Backend .env Update:**
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<paste-16-char-password-here>
```

## ▶️ Part 2: Start the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev

# Expected output:
# Server running on port 5000
# Environment: development
# MongoDB connected: localhost
```

**Backend is running at:** `http://localhost:5000`

### Terminal 2: Start Frontend Server

```bash
cd frontend
npm start

# Browser automatically opens to: http://localhost:3000
# If not, manually visit: http://localhost:3000
```

**Frontend is running at:** `http://localhost:3000`

---

## 🧪 Part 3: Test the Application

### ✅ Test 1: Login & OTP Flow

```
1. Open http://localhost:3000 in browser
2. Enter your email address
3. Click "Send OTP"
4. Expected:
   - Page displays "Enter OTP" screen
   - You receive email from your Gmail account
   - Email contains 6-digit OTP

5. Copy OTP from email
6. Paste into the OTP input field
7. Click "Verify OTP"
8. Expected:
   - Redirect to Dashboard
   - Sidebar visible on left
   - Chat UI on right
   - Token saved in localStorage
```

**If email doesn't arrive:**
- Check Gmail spam folder
- Check backend logs for errors
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in .env

**If OTP verification fails:**
- Check that OTP hasn't expired (10 minutes)
- Verify exact characters match (no spaces)
- Check backend logs for error details

### ✅ Test 2: Upload Meeting

```
1. From Dashboard, click "Upload Meeting" button
2. Fill form:
   - Meeting Name: "Q1 Quarterly Review"
   - File: Select a .mp4 or .wav file
   - Add Participant: Click "+ Add Participant"
   - Enter participant email: colleague@example.com
   
3. Click "Upload Meeting"
4. Expected:
   - Success message displays
   - Modal closes automatically
   - You're back on Chat UI
   - File appears in backend/uploads/
```

**Test file locations:**
- Sample video: Create 1-second MP4
- Sample audio: Record WAV file with phone/computer

**If upload fails:**
- Check file format (only .mp4, .wav, .mp3 allowed)
- Check file size (max 500MB)
- Check email validation (participant emails must be valid)
- Check backend logs for upload errors

### ✅ Test 3: Chat / Query

```
1. In Chat UI, type a message:
   "What was discussed in the meeting?"
   
2. Click "Send" or press Enter
3. Expected:
   - Message appears on right (blue)
   - Assistant response appears on left (white)
   - Response mentions uploaded meetings
   
4. Response is a placeholder for now
   (Full RAG integration coming in v2)
```

**If query fails:**
- Check backend logs for error
- Verify JWT token is valid
- Try uploading a meeting first

### ✅ Test 4: Persistence (Refresh Test)

```
1. Successfully login and upload a meeting
2. Refresh the page (F5)
3. Expected:
   - Still logged in (token in localStorage)
   - Still on Dashboard
   - No need to re-verify OTP
   
4. Query the chat
5. Should see previously uploaded meetings
```

**If logged out after refresh:**
- Check localStorage (F12 → Application → Storage)
- Token should exist
- Clear localStorage and re-login

---

## 🐛 Part 4: Troubleshooting

### Cannot connect to MongoDB

**Error: "MongoDB connection failed"**

**Solution:**
```bash
# 1. Check MongoDB service is running

# Verify connection:
mongo  # should open MongoDB shell
# Exit with: exit()

# 2. If MongoDB not installed:
# Download from: https://www.mongodb.com/try/download/community
# Install and restart service

# 3. Check connection string in .env:
# Should be: mongodb://localhost:27017/meeting-rag
```

### Backend server crashes after starting

**Error: "PORT already in use"**

**Solution:**
```bash
# Find process using port 5000:
netstat -ano | findstr :5000

# Kill the process (replace <PID>):
taskkill /PID <PID> /F

# Or change port in backend/.env:
PORT=5001
```

### Email not sending / OTP not received

**Error: "Failed to send OTP email"**

**Solution:**
```bash
# 1. Verify Gmail credentials in .env:
# Must use App Password (not regular password)

# 2. Generate new App Password:
# https://myaccount.google.com/apppasswords
# Gmail → Windows Computer → Generate

# 3. Check backend logs:
# Look for "Error sending OTP email" messages

# 4. Verify email was sent:
# Frontend should show "OTP sent successfully"
# Even if email delivery fails
```

### CORS errors in browser console

**Error: "Access to XMLHttpRequest blocked by CORS"**

**Solution:**
```bash
# Backend .env:
CORS_ORIGIN=http://localhost:3000

# Frontend .env:
REACT_APP_API_URL=http://localhost:5000

# Restart both servers after changing
```

### Token expired / Unauthorized errors

**Error: "Unauthorized - Token expired"**

**Solution:**
```bash
# 1. JWT tokens expire after 7 days
# 2. Logout and re-login (refresh OTP)

# To logout:
# - Click "Logout" in Sidebar
# - Or clear localStorage manually
# - Or start fresh browser session
```

### Cannot upload file

**Error: "File must be MP4, WAV, or MP3 format"**

**Solution:**
```bash
# 1. Check file extension
# 2. Verify file is actually video/audio (not renamed copy)
# 3. Test with known working file format
# 4. Max file size: 500MB
# 5. For testing, use: Audacity to create WAV
```

---

## 📊 Verify Everything Works

Create a checklist to verify:

- [ ] Backend server starts: `npm run dev` (port 5000)
- [ ] Frontend server starts: `npm start` (port 3000)
- [ ] Can visit `http://localhost:3000` in browser
- [ ] Can send OTP and receive email
- [ ] Can verify OTP and login
- [ ] Can upload meeting file
- [ ] Can send chat message
- [ ] Can refresh page without losing login
- [ ] MongoDB has User and Meeting documents

**To check MongoDB:**
```bash
# In MongoDB shell:
mongo
use meeting-rag
db.users.find()           # Should show your user
db.meetings.find()        # Should show uploads
```

---

## 🎯 Next Steps After Setup

### For Development:
1. Modify components in `frontend/src/components/`
2. Changes auto-reload in browser
3. Check browser console for React errors

### For Backend Development:
1. Modify files in `backend/controllers/`, `backend/routes/`
2. Server auto-restarts with `npm run dev`
3. Check server logs for errors

### For Production:
1. Frontend: `npm run build` → deploy `build/` folder
2. Backend: Deploy Docker container or use Railway/Heroku
3. Update environment variables in hosting platform

---

## 📞 Common Questions

**Q: Do I need to install MongoDB?**
A: Yes, or use MongoDB Atlas (cloud). Local recommended for development.

**Q: Can I use a different email service?**
A: Yes, modify `backend/config/email.js` for your provider.

**Q: Can I change the port?**
A: Yes, update `PORT` in backend/.env and `REACT_APP_API_URL` in frontend/.env

**Q: How long does OTP last?**
A: OTP lasts 10 minutes. JWT token lasts 7 days.

**Q: Where are files stored?**
A: In `backend/uploads/` directory locally.

---

## ✅ You're Ready!

If all tests pass, your MeetingRAG application is fully functional. 

Happy coding! 🎉
