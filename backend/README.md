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


# Entra ID (Microsoft) Configuration
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here

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


### 3. Entra ID (Microsoft) Setup

1. Register your app in Azure Portal (Entra ID)
2. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET in your .env
3. Configure frontend MSAL in `frontend/src/authConfig.js`

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
Authentication is handled via Microsoft Entra ID (MSAL). All API endpoints require a valid Bearer token from Entra ID login.

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


### Entra ID/MSAL Issues
- Check your tenant ID, client ID, and secret in .env and frontend config

### Port Already in Use
- Change `PORT` in `.env` or kill process using port 5000:
  ```bash
  # On Windows:
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

## Development Notes

- JWT tokens expire after 7 days
- Files are stored in `/uploads` directory (must exist)
- Maximum file size: 500MB
