
# Resume Generator Backend

This is the Node.js Express backend for the AI Resume Generator application.

## Setup Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   # For development (with auto-restart)
   npm run dev

   # For production
   npm start
   ```

The server will start on http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user info

### Resumes
- `GET /api/resumes/usage` - Check daily usage limits
- `POST /api/upload` - Upload resume file
- `POST /api/resumes/generate-with-job` - Generate tailored resume with job description
- `GET /api/resumes` - Get user's resumes
- `DELETE /api/resumes/:id` - Delete a resume

### Profile
- `PUT /api/profile` - Update user profile

### Subscription
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/checkout` - Create checkout session

## Database

The application uses SQLite with the following tables:
- `users` - User accounts
- `resumes` - Uploaded resumes
- `resume_usage` - Daily usage tracking
- `subscriptions` - Subscription status

## File Uploads

Uploaded files are stored in the `uploads/` directory. Supported formats:
- PDF (.pdf)
- Word documents (.doc, .docx)
- Images (.jpg, .jpeg, .png)

## Environment Variables

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT signing secret (change in production!)

## Notes

- The AI resume generation is currently mocked
- To integrate real AI, add OpenAI, Claude, or similar API
- For production, use a proper database like PostgreSQL
- Add proper error logging and monitoring
