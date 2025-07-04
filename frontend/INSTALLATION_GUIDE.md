# ChitChat Application - Installation & Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Quick Start](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [Testing the Installation](#testing-the-installation)
9. [Troubleshooting](#troubleshooting)
10. [Development Tools](#development-tools)
11. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software

Before setting up ChitChat, ensure you have the following installed:

| Software | Version | Download Link | Purpose |
|----------|---------|---------------|---------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org/) | Frontend package management |
| **npm** | 8.0+ | Included with Node.js | Package manager |
| **Deno** | 1.40+ | [deno.land](https://deno.land/) | Backend runtime |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | Version control |

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 1GB free space for dependencies
- **Network**: Internet connection for package downloads and API services

### Optional Tools

- **VS Code**: Recommended IDE with Deno and React extensions
- **PostgreSQL Client**: For database management (pgAdmin, DBeaver)
- **Postman**: For API testing and development

---

## Project Overview

ChitChat is a full-stack chat application with:

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Deno + Oak Framework + TypeScript
- **Database**: Neon PostgreSQL (cloud-hosted)
- **AI Integration**: Google Gemini API

### Architecture

```
ChitChat Application
├── Frontend (Port 5173)
│   ├── React Application
│   ├── Vite Dev Server
│   └── Tailwind CSS
├── Backend (Port 8000)
│   ├── Deno Runtime
│   ├── Oak Framework
│   └── REST API
└── Database
    └── Neon PostgreSQL
```

---

## Quick Start

### 1. Clone the Repository

```bash
# Clone the project
git clone <repository-url>
cd chichat-app
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Verify Deno installation
deno --version

# Start development server
deno task dev
```

### 3. Frontend Setup (5 minutes)

```bash
# Open new terminal and navigate to frontend
cd frontend

# Verify Node.js installation
node --version
npm --version

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

---

## Detailed Setup

### Step 1: Environment Setup

#### Install Deno (Backend Runtime)

**Windows (PowerShell):**
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

**Manual Installation:**
1. Download from [deno.land/install](https://deno.land/install)
2. Add to PATH environment variable

#### Install Node.js (Frontend Dependencies)

**Option 1: Direct Download**
- Visit [nodejs.org](https://nodejs.org/)
- Download LTS version
- Run installer

**Option 2: Package Manager**
```bash
# macOS with Homebrew
brew install node

# Windows with Chocolatey
choco install nodejs

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm
```

#### Verify Installations

```bash
# Check Deno
deno --version
# Expected: deno 1.40.0+ (release, ...)

# Check Node.js
node --version
# Expected: v18.0.0+

# Check npm
npm --version
# Expected: 8.0.0+
```

### Step 2: Project Structure Exploration

```bash
# Navigate to project root
cd chichat-app

# Explore structure
ls -la
# Should show: backend/, frontend/, *.md files

# Check backend structure
ls -la backend/
# Should show: src/, main.ts, deno.json

# Check frontend structure  
ls -la frontend/
# Should show: components/, services/, package.json
```

### Step 3: Backend Configuration

#### Create Environment File

```bash
cd backend

# Create .env file (if not exists)
cp .env.example .env  # If example exists
# OR create manually:
touch .env
```

#### Configure Backend Environment

Edit `backend/.env`:

```bash
# Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_sFid7Gfq8DcS@ep-empty-snowflake-a1mipsm3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="7d"

# Server Configuration
PORT=8000
CORS_ORIGIN="http://localhost:5173"

# API Keys
GEMINI_API_KEY="your-gemini-api-key-here"

# Development
NODE_ENV="development"
LOG_LEVEL="debug"
```

#### Install and Run Backend

```bash
# No explicit installation needed for Deno
# Dependencies are downloaded on first run

# Start development server
deno task dev

# You should see:
# 🚀 ChitChat Backend API starting on port 8000...
# ✅ Server is running on http://localhost:8000
```

### Step 4: Frontend Configuration

#### Install Dependencies

```bash
cd frontend

# Install all dependencies
npm install

# You should see:
# added XXX packages in XXs
```

#### Configure Frontend Environment

Create `frontend/.env.local`:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000

# Development
NODE_ENV=development

# Gemini API (for fallback)
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

#### Start Frontend Development Server

```bash
# Start Vite development server
npm run dev

# You should see:
# VITE v6.2.0  ready in XXXms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Secret key for JWT tokens |
| `JWT_EXPIRY` | No | `7d` | Token expiration time |
| `PORT` | No | `8000` | Server port |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins |
| `GEMINI_API_KEY` | No | - | Google Gemini API key |
| `NODE_ENV` | No | `development` | Environment mode |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:8000` | Backend API URL |
| `NODE_ENV` | No | `development` | Environment mode |
| `GEMINI_API_KEY` | No | `PLACEHOLDER_API_KEY` | Fallback API key |

### Getting API Keys

#### Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create new API key
4. Copy key to environment variables

**Security Note**: Never commit real API keys to version control.

---

## Database Setup

### Database Information

The application uses a pre-configured Neon PostgreSQL database:

- **Provider**: Neon (cloud PostgreSQL)
- **Location**: Asia-Pacific (Singapore)
- **SSL**: Required
- **Schema**: Already created and populated

### Database Connection

The database is already set up with:

1. **Tables**: All required tables created
2. **Relationships**: Foreign keys configured
3. **Indexes**: Performance optimizations applied
4. **Sample Data**: Basic test data available

### Verify Database Connection

```bash
# Start backend and check logs
cd backend
deno task dev

# Look for successful database connection:
# ✅ Database connected successfully
```

### Database Schema

Key tables include:

- `auth_users`: Authentication data
- `users`: User profiles  
- `chat_rooms`: Chat room definitions
- `messages`: Chat messages
- `room_participants`: Room membership
- `attachments`: File attachments
- `user_contacts`: Friend relationships
- `bot`: AI bot configurations

---

## Running the Application

### Development Mode

#### Terminal 1: Backend Server

```bash
cd backend
deno task dev

# Output should show:
# 🚀 ChitChat Backend API starting on port 8000...
# ✅ Server is running on http://localhost:8000
# 📋 Health check: http://localhost:8000/health
```

#### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev

# Output should show:
# VITE v6.2.0  ready in XXXms
# ➜  Local:   http://localhost:5173/
```

### Available Scripts

#### Backend Scripts

```bash
# Development with hot reload
deno task dev

# Production start
deno task start

# Database operations (if using Prisma)
deno task db:pull
deno task db:push
deno task db:generate
```

#### Frontend Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Server Status Verification

#### Backend Health Check

```bash
# Method 1: Browser
# Visit: http://localhost:8000/health

# Method 2: curl
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

#### Frontend Access

```bash
# Browser: http://localhost:5173
# Should show ChitChat login/signup page
```

---

## Testing the Installation

### 1. API Connectivity Test

```bash
# Test backend API
curl http://localhost:8000/health

# Expected: {"status":"ok",...}
```

### 2. Frontend Loading Test

1. Open browser to http://localhost:5173
2. Should see ChitChat authentication page
3. Check browser console for errors (F12)

### 3. Database Connectivity Test

1. Backend should start without database errors
2. Look for successful connection message in logs

### 4. User Registration Test

1. Navigate to registration page
2. Fill out form with test data:
   - **Full Name**: Test User
   - **Username**: testuser
   - **Email**: test@example.com
   - **Password**: password123
3. Submit form
4. Should redirect to main chat interface

### 5. API Integration Test

1. Register/login successfully
2. Navigate to Gemini Bot
3. Send a test message
4. Should receive response (if API key configured)

---

## Troubleshooting

### Common Issues and Solutions

#### Backend Won't Start

**Issue**: `Permission denied` or `command not found`

**Solution**:
```bash
# Verify Deno installation
deno --version

# If not found, reinstall Deno
curl -fsSL https://deno.land/install.sh | sh

# Add to PATH (Linux/macOS)
export PATH="$HOME/.deno/bin:$PATH"
```

**Issue**: `Database connection failed`

**Solution**:
```bash
# Check DATABASE_URL in .env
# Ensure URL is correctly formatted
# Test connection manually if possible
```

#### Frontend Won't Start

**Issue**: `npm: command not found`

**Solution**:
```bash
# Install Node.js from nodejs.org
# Verify installation
node --version
npm --version
```

**Issue**: `Module not found` errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### CORS Errors

**Issue**: Browser blocks API requests

**Solution**:
```bash
# Check CORS_ORIGIN in backend .env
CORS_ORIGIN="http://localhost:5173"

# Restart backend after changes
```

#### Port Already in Use

**Issue**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port
lsof -i :8000  # For backend
lsof -i :5173  # For frontend

# Kill process
kill -9 <PID>

# Or use different ports in config
```

### Debug Mode

#### Backend Debug Logging

```bash
# Set debug mode in .env
LOG_LEVEL="debug"

# Restart backend to see detailed logs
deno task dev
```

#### Frontend Debug Mode

```bash
# Check browser console (F12)
# Look for network requests in Network tab
# Check for errors in Console tab
```

### Getting Help

1. **Check Logs**: Always check both backend and frontend logs
2. **Browser Console**: Check for JavaScript errors (F12)
3. **Network Tab**: Verify API requests are being made
4. **Database Logs**: Check database connection status
5. **Environment Variables**: Verify all required variables are set

---

## Development Tools

### Recommended VS Code Extensions

```bash
# Install extensions
code --install-extension denoland.vscode-deno
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension formulahendry.auto-rename-tag
```

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": false,
  "typescript.suggest.autoImports": false,
  "typescript.preferences.importModuleSpecifier": "relative",
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Git Configuration

```bash
# Set up Git hooks (optional)
git config core.hooksPath .githooks

# Create pre-commit hook
cat > .githooks/pre-commit << 'EOF'
#!/bin/sh
cd frontend && npm run type-check
cd ../backend && deno fmt --check
EOF

chmod +x .githooks/pre-commit
```

---

## Production Deployment

### Build for Production

#### Frontend Build

```bash
cd frontend

# Create production build
npm run build

# Test production build locally
npm run preview
```

#### Backend Preparation

```bash
cd backend

# Test production mode
deno task start
```

### Environment Variables for Production

#### Backend Production (.env)

```bash
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-production-secret-key"
PORT=8000
CORS_ORIGIN="https://your-frontend-domain.com"
GEMINI_API_KEY="your-production-api-key"
NODE_ENV="production"
```

#### Frontend Production (.env.production)

```bash
VITE_API_URL="https://your-backend-domain.com"
NODE_ENV="production"
```

### Deployment Options

#### Frontend Deployment

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   cd frontend
   vercel --prod
   ```

2. **Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

#### Backend Deployment

1. **Deno Deploy** (Recommended)
   ```bash
   deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts
   deployctl deploy --project=chitchat-backend main.ts
   ```

2. **Railway**
   - Connect GitHub repository
   - Set start command: `deno task start`

### Security Checklist for Production

- [ ] Change default JWT secret
- [ ] Use strong passwords for database
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up proper environment variables
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

---

## Next Steps

After successful installation:

1. **Explore the Application**: Register a user and test features
2. **Read Documentation**: Review PROJECT_DOCUMENTATION.md
3. **Customize Settings**: Modify environment variables as needed
4. **Set up Development Environment**: Configure your preferred IDE
5. **Start Development**: Begin customizing and extending the application

### Learning Resources

- **React Documentation**: [react.dev](https://react.dev)
- **Deno Manual**: [deno.land/manual](https://deno.land/manual)
- **TypeScript Handbook**: [typescriptlang.org](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/docs)

---

**Congratulations!** 🎉 You have successfully set up ChitChat. The application should now be running with both frontend and backend servers active. You can start exploring the features and customizing the application to your needs.
