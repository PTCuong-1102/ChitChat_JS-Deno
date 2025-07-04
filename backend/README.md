# ChitChat Backend API

A Deno-based backend API for the ChitChat application, built with Oak framework and PostgreSQL.

## 🚀 Features

- **Authentication**: JWT-based authentication with registration and login
- **Real-time Chat**: RESTful API for chat rooms and messaging
- **User Management**: User profiles, contacts, and blocking
- **Database**: PostgreSQL with Neon cloud hosting
- **Security**: Password hashing, CORS, error handling
- **Modern Stack**: Deno runtime with TypeScript

## 📋 Prerequisites

- [Deno](https://deno.land/) 1.40+ installed
- PostgreSQL database (Neon cloud instance configured)
- Git

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chitchat-app/backend
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Install and verify Deno**
   ```bash
   deno --version
   ```

## 🗄️ Database Setup

The application uses a Neon PostgreSQL database. The schema is already created in the database, including:

- `auth_users` - Authentication data
- `users` - User profiles
- `chat_rooms` - Chat rooms (DM and group)
- `messages` - All messages
- `room_participants` - Room membership
- `user_contacts` - Friend relationships
- `blocked_users` - Blocked user lists

## 🏃‍♂️ Running the Application

### Development Mode
```bash
deno task dev
```

### Production Mode
```bash
deno task start
```

### Available Commands
```bash
# Start development server with auto-reload
deno task dev

# Start production server
deno task start

# Database commands (if using Prisma)
deno task db:pull      # Pull schema from database
deno task db:push      # Push schema to database
deno task db:generate  # Generate client
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Chat
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create group chat
- `POST /api/chat/rooms/dm` - Create direct message
- `GET /api/chat/rooms/:id/messages` - Get chat messages
- `POST /api/chat/rooms/:id/messages` - Send message
- `GET /api/chat/rooms/:id/participants` - Get room participants

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users
- `PUT /api/users/me` - Update profile
- `GET /api/users/contacts` - Get user contacts
- `POST /api/users/contacts` - Add contact
- `DELETE /api/users/contacts/:id` - Remove contact
- `POST /api/users/block` - Block user
- `POST /api/users/unblock` - Unblock user

### Data
- `GET /api/data/bootstrap` - Get initial app data

### Health Check
- `GET /health` - API health status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Neon database URL |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key` |
| `JWT_EXPIRY` | JWT token expiration time | `7d` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `NODE_ENV` | Environment mode | `development` |

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Database connection
│   │   └── env.ts        # Environment variables
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/       # Middleware functions
│   │   ├── auth.middleware.ts
│   │   ├── cors.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── routes/           # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   └── user.service.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       ├── hash.ts       # Password hashing
│       └── jwt.ts        # JWT utilities
├── main.ts               # Application entry point
├── deno.json             # Deno configuration
├── .env                  # Environment variables
└── README.md             # This file
```

## 🔐 Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Authentication**: Stateless token-based authentication
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Error Handling**: Secure error responses without sensitive data

## 🧪 Testing

```bash
# Run tests (when implemented)
deno test --allow-all

# Run with coverage
deno test --allow-all --coverage=coverage
```

## 📦 Deployment

### Deno Deploy
```bash
# Install Deno Deploy CLI
deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# Deploy to Deno Deploy
deployctl deploy --project=chitchat-backend main.ts
```

### Docker (Optional)
```bash
# Build Docker image
docker build -t chitchat-backend .

# Run container
docker run -p 8000:8000 --env-file .env chitchat-backend
```

## 📈 Performance Tips

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Connection Pooling**: Use connection pooling for database connections
3. **Caching**: Implement Redis for caching frequently accessed data
4. **Rate Limiting**: Add rate limiting middleware for API endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL is correct
   - Ensure network access to Neon database
   - Verify SSL mode is set to "require"

2. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend URL matches CORS origin

3. **JWT Token Issues**
   - Verify JWT_SECRET is consistent
   - Check token expiration time

### Debug Mode

Set environment variable for verbose logging:
```bash
export LOG_LEVEL=debug
deno task dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
