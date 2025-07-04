# Profile Update Debugging Guide

## 🚨 Issue Summary
- Profile changes (name, photo) don't persist after page reload
- Changes don't appear in profile bar after closing modal

## ✅ Fixes Applied

### 1. **App.tsx**
- ✅ Added `handleUserUpdate()` function that updates both state and localStorage
- ✅ Passes `onUserUpdate` prop to MainLayout

### 2. **MainLayout.tsx** 
- ✅ Added `onUserUpdate` prop to interface
- ✅ Passes `onUserUpdate` to UserProfileModal

### 3. **Backend Controllers**
- ✅ Added debugging logs to user profile update endpoint
- ✅ Added debugging logs to image upload endpoint

### 4. **Frontend API & Modal**
- ✅ Added comprehensive debugging logs throughout the update flow
- ✅ Enhanced error handling and state management

## 🧪 Testing Steps

### Prerequisites
1. **Start Backend**:
   ```bash
   cd backend
   deno task dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend  
   npm run dev
   ```

### Test Profile Name Update

1. **Login** to the application
2. **Open Profile Modal** (click your avatar in sidebar)
3. **Edit Name**: Click the edit icon next to your name
4. **Change Name**: Type a new name and click the checkmark
5. **Check Console**: Look for these logs:

#### Expected Frontend Logs:
```
📤 Sending profile update: {name: "New Name"}
🌐 API Request: {method: "PUT", url: "http://127.0.0.1:8000/api/users/me", hasToken: true}
📡 API Response: {status: 200, statusText: "OK", url: "..."}
📝 Raw backend response: {user: {...}}
🔄 Transformed user data: {original: {...}, transformed: {...}}
📥 Received profile update response: {user: {...}}
🔄 Calling onUserUpdate with: {user object}
🔄 App.handleUserUpdate called: {user object}
✅ User state updated in App
```

#### Expected Backend Logs:
```
👤 UserController.updateProfile called: {userId: "...", requestBody: {name: "New Name"}}
🔄 Updates to be applied: {full_name: "New Name"}
🔄 UserService.updateProfile called: {userId: "...", updates: {full_name: "New Name"}}
📝 SQL Query: {query: "UPDATE users SET full_name = $2 WHERE id = $1 RETURNING *", values: [...]}
📋 Query result: {rowCount: 1, user: {...}}
✅ Profile updated successfully: {userId: "...", updatedUser: {...}}
```

6. **Test Persistence**:
   - ✅ **Name should update in the modal immediately**
   - ✅ **Close modal - name should update in sidebar**  
   - ✅ **Reload page - name should persist**

### Test Profile Photo Update

1. **Open Profile Modal**
2. **Click "Change Photo"**
3. **Select an Image File**
4. **Check Console**: Look for these logs:

#### Expected Frontend Logs:
```
📷 Uploading profile image: filename.jpg
🌐 API Request: {method: "POST", url: "http://127.0.0.1:8000/api/upload/profile", hasToken: true}
📡 API Response: {status: 200, statusText: "OK"}  
✅ Profile image uploaded: {imageUrl: "http://127.0.0.1:8000/uploads/...", user: {...}}
📥 Avatar upload response: {user: {...}}
🔄 Calling onUserUpdate with avatar response: {user object}
🔄 App.handleUserUpdate called: {user object}
✅ User state updated in App
```

#### Expected Backend Logs:
```
📸 Profile image upload request: {userId: "...", fileName: "...", fileSize: "..."}
🔄 Updating user profile with avatar URL: {userId: "...", imageUrl: "..."}
🔄 UserService.updateProfile called: {userId: "...", updates: {avatar_url: "..."}}
📝 SQL Query: {query: "UPDATE users SET avatar_url = $2 WHERE id = $1 RETURNING *", values: [...]}
📋 Query result: {rowCount: 1, user: {...}}
✅ Profile image uploaded successfully: {userId: "...", imageUrl: "...", newAvatarUrl: "..."}
```

4. **Test Persistence**:
   - ✅ **Photo should appear in modal immediately**
   - ✅ **Close modal - photo should appear in sidebar**
   - ✅ **Reload page - photo should persist**

## 🔍 Debugging Troubleshooting

### If Name/Profile Updates Don't Work:

#### Check Frontend Console:
- ❌ **Missing "📤 Sending profile update"** → UserProfileModal isn't calling API
- ❌ **Missing "🔄 App.handleUserUpdate called"** → onUserUpdate callback not wired properly
- ❌ **API Error Response** → Backend endpoint issue

#### Check Backend Console:  
- ❌ **Missing "👤 UserController.updateProfile called"** → Route not hit
- ❌ **Missing SQL Query logs** → Database connection issue
- ❌ **SQL Error** → Database schema or permissions issue

#### Check Network Tab:
- ❌ **PUT request to `/api/users/me` failing** → Backend route or auth issue
- ❌ **POST request to `/api/upload/profile` failing** → File upload issue

#### Check localStorage:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('chitchat_user_data'))
```
- ❌ **User data not updated** → handleUserUpdate not saving to localStorage

### Common Issues & Solutions:

1. **Backend Not Running**
   ```bash
   # Install Deno if needed
   # Then start backend
   cd backend && deno task dev
   ```

2. **Database Connection Issues**
   - Check `.env` file in backend
   - Verify PostgreSQL is running
   - Check database schema matches expectations

3. **CORS Issues**  
   - Backend should allow requests from frontend URL
   - Check browser network tab for CORS errors

4. **Authentication Issues**
   - Check if auth token exists: `localStorage.getItem('chitchat_auth_token')`
   - Verify token is being sent in requests

5. **File Upload Issues**
   - Check `backend/uploads/profiles/` directory exists and is writable
   - Verify file size limits and file type restrictions

## 📊 Success Indicators

When everything works correctly:

✅ **Immediate Updates**: Changes appear in UI right away
✅ **State Persistence**: Changes remain when closing/reopening modal  
✅ **Page Persistence**: Changes survive page reload
✅ **Complete Logs**: All expected log entries appear in console
✅ **Database Updates**: SQL queries execute successfully
✅ **localStorage Updates**: User data is saved locally

## 🎯 Next Steps

Run through these tests and share:
1. **Which step fails** (if any)
2. **Console logs** from both frontend and backend
3. **Network tab errors** (if any)
4. **Specific behavior** you're seeing vs expected

This will help pinpoint exactly where the issue is occurring!
