# Backend Configuration

## Environment Variables (.env)

Copy the following template into a `.env` file in the backend directory and fill in your values:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/meeting-rag
# OR for MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meeting-rag

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password_here
# For Gmail: Generate an App Password at https://myaccount.google.com/apppasswords

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Make sure MongoDB is running locally
# Default connection: mongodb://localhost:27017/meeting-rag
```

#### Option B: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`

### 3. Email Service Setup (Gmail)

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Generate an app password
4. Copy the 16-character password to `EMAIL_PASSWORD` in `.env`

### 4. Start the Server

#### Development (with auto-reload):
```bash
npm run dev
```

#### Production:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- **POST** `/send-otp` - Send OTP to email
  ```json
  { "email": "user@example.com" }
  ```

- **POST** `/verify-otp` - Verify OTP
  ```json
  { "email": "user@example.com", "otp": "123456" }
  ```

### Meetings (requires JWT token in Authorization header)
- **POST** `/upload-meeting` - Upload meeting file
  - Form data: `file`, `meetingName`, `participants`

- **POST** `/query` - Query meetings
  ```json
  { "query": "What was discussed about salary?" }
  ```

- **GET** `/meetings` - Get user's meetings

### Health Check
- **GET** `/health` - Server health check

## Error Handling

The API returns proper HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `429` - Rate Limited
- `500` - Server Error

## Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify `MONGODB_URI` is correct
- Check firewall/network access

### Email Not Sending
- Verify Gmail app password is correct
- Enable "Less secure app access" if not using App Passwords
- Check email service configuration in `config/email.js`

### Port Already in Use
- Change `PORT` in `.env` or kill process using port 5000:
  ```bash
  # On Windows:
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

## Development Notes

- OTPs expire after 10 minutes
- OTP requests are rate-limited to 1 per minute
- JWT tokens expire after 7 days
- Files are stored in `/uploads` directory (must exist)
- Maximum file size: 500MB
