# 🧪 Frontend-Backend Integration Test

## Prerequisites

1. **Backend running** on port 8000
2. **Frontend running** on port 3000  
3. **Database** connected (Neon PostgreSQL)

## 🚀 Quick Test Steps

### 1. Start Backend
```powershell
cd backend
C:\Users\PTCuong\.deno\bin\deno.exe task dev
```
You should see:
- ✅ Connected to PostgreSQL database
- 🚀 ChitChat Backend API starting on port 8000...

### 2. Start Frontend (in new terminal)
```powershell
cd frontend
npm run dev
```
You should see:
- ➜ Local: http://localhost:3000/

### 3. Run Integration Test
```powershell
.\test-integration.ps1
```

### 4. Manual Frontend Test

1. **Open** http://localhost:3000
2. **Register** a new user:
   - Full Name: Test User
   - Username: testuser123
   - Email: test@example.com
   - Password: password123

3. **Check browser console** for API logs:
   - 🌐 API Request logs
   - 📡 API Response logs
   - ✅ Success messages

4. **Login** with the same credentials

## ✅ Expected Results

### Backend Logs Should Show:
```
📝 Register request received:
  Method: POST
  Content-Type: application/json
  Body: { fullName: "Test User", userName: "testuser123", ... }
```

### Frontend Console Should Show:
```
🌐 API Request: { method: 'POST', url: 'http://localhost:8000/api/auth/register', hasToken: false }
📡 API Response: { status: 201, statusText: 'Created', url: '...' }
✅ Registration successful: { user: {...}, token: '...' }
```

### Database Should Contain:
- New user in `auth_users` table
- New user profile in `users` table
- JWT token generated and stored in frontend

## 🐛 Troubleshooting

### Backend Issues:
- **Port 8000 in use**: Change PORT in `.env`
- **Database connection failed**: Check DATABASE_URL
- **CORS errors**: Verify CORS_ORIGIN setting

### Frontend Issues:
- **Port 3000 in use**: Vite will suggest alternative port
- **API connection failed**: Check VITE_API_URL in `.env.local`
- **Build errors**: Run `npm install` to install dependencies

### Network Issues:
- **Firewall blocking**: Allow ports 3000 and 8000
- **CORS errors**: Check browser network tab for preflight requests

## 🎯 Success Indicators

- ✅ User registration works without errors
- ✅ User login works without errors  
- ✅ API requests show in browser network tab
- ✅ Backend logs show incoming requests
- ✅ JWT tokens are generated and stored
- ✅ Database contains new user data

## 📋 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check API responds
- [ ] User registration API works
- [ ] User login API works
- [ ] Bootstrap data API works
- [ ] CORS is configured correctly
- [ ] JWT authentication works
- [ ] Database queries execute successfully
- [ ] Frontend-backend communication is established

## 🎉 Integration Complete!

If all tests pass, your frontend and backend are successfully integrated and ready for development!
