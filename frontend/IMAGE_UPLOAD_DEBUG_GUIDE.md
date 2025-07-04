# Image Upload Debugging Guide

## 🚨 Current Issue
- Profile name updates work ✅
- Profile photo uploads show as error image ❌

## 🔧 Enhanced Debugging Applied

### Backend Enhancements
1. **Static File Serving** - Added detailed logging for all `/uploads/` requests
2. **Upload Controller** - Enhanced logging for file upload process
3. **User Service** - SQL query logging for profile updates

### Frontend Enhancements  
1. **API Service** - Step-by-step URL transformation logging
2. **transformUserData** - Detailed avatar URL processing logging
3. **UserProfileModal** - Upload response logging

## 🧪 Step-by-Step Debugging

### Step 1: Check the Upload Process

1. **Upload a photo** through the profile modal
2. **Check Frontend Console** for these logs in order:

```
📷 Uploading profile image: filename.jpg
🌐 API Request: {method: "POST", url: "http://127.0.0.1:8000/api/upload/profile", hasToken: true}
📡 API Response: {status: 200, statusText: "OK"}
📦 Raw upload response from backend: {imageUrl: "/uploads/profiles/...", user: {...}}
🔗 Converted imageUrl to full URL: http://127.0.0.1:8000/uploads/profiles/...
🔗 Converted user avatar_url to full URL: http://127.0.0.1:8000/uploads/profiles/...
📝 User data before transformation: {...}
🧮 transformUserData processing: {...}
🧮 transformUserData result: {...}
🔄 User data after transformation: {...}
✅ Profile image uploaded: {...}
📥 Avatar upload response: {...}
🔄 Calling onUserUpdate with avatar response: {...}
🔄 App.handleUserUpdate called: {...}
✅ User state updated in App
```

3. **Check Backend Console** for these logs:

```
📸 Profile image upload request: {userId: "...", fileName: "...", fileSize: "..."}
🔄 Updating user profile with avatar URL: {userId: "...", imageUrl: "..."}
🔄 UserService.updateProfile called: {userId: "...", updates: {avatar_url: "..."}}
📝 SQL Query: {query: "UPDATE users SET avatar_url = $2 WHERE id = $1 RETURNING *", values: [...]}
📋 Query result: {rowCount: 1, user: {...}}
✅ Profile image uploaded successfully: {...}
```

### Step 2: Check Static File Access

After upload, you should see a request for the image in backend console:

```
📁 Static file request: {pathname: "/uploads/profiles/user123_1234567890_abc123.jpg", method: "GET"}
✅ Static file served successfully: /uploads/profiles/user123_1234567890_abc123.jpg
```

**If you see this instead:**
```
❌ Static file not found or error: {pathname: "/uploads/profiles/...", error: "..."}
```

Then the file wasn't actually saved or there's a path issue.

### Step 3: Manual Testing

#### Test 1: Open the debug files I created

1. **Open `test-static-files.html`** in your browser
2. **Login to your app first** (to get auth token)
3. **Go back to the test page** and try uploading a file
4. **Check the results** - it will test:
   - Backend connectivity
   - Upload endpoints
   - Static file serving
   - Generated image URLs

#### Test 2: Run console debugging

1. **Copy and paste the code from `debug-image-console.js`** into your browser console
2. **Run it after uploading a photo**
3. **Check the results** - it will show:
   - Current user data in localStorage
   - Avatar URL format
   - Whether the image URL is accessible

### Step 4: Check File System

**In the backend directory:**
```bash
ls -la uploads/profiles/
```

**Or in PowerShell:**
```powershell
Get-ChildItem ..\backend\uploads\profiles\ -File
```

You should see uploaded files with names like: `user123_1234567890_abc123.jpg`

## 🔍 Common Issues & Solutions

### Issue 1: Files Not Being Saved
**Symptoms:** Upload succeeds but no files in `/uploads/profiles/`

**Check:**
- Backend console for upload errors
- File permissions on uploads directory
- Disk space

**Solution:**
```bash
# Ensure directory exists and is writable
mkdir -p uploads/profiles
chmod 755 uploads/profiles
```

### Issue 2: Files Saved But Not Accessible
**Symptoms:** Files exist but browser shows error image

**Check:**
- Backend static file serving logs
- URL format in frontend
- CORS headers

**Test manually:**
```bash
# Try accessing file directly
curl http://127.0.0.1:8000/uploads/profiles/filename.jpg
```

### Issue 3: Wrong URL Format
**Symptoms:** URLs like `http://127.0.0.1:8000http://127.0.0.1:8000/uploads/...`

**Check:**
- Frontend URL transformation logic
- Backend response format

### Issue 4: Authentication Issues
**Symptoms:** Upload returns 401 or 403

**Check:**
- Auth token in localStorage
- Token being sent in headers
- Backend auth middleware

## 🎯 Specific Debugging Steps

### If Images Show as Error:

1. **Check the image URL in user data:**
   ```javascript
   // In browser console:
   const user = JSON.parse(localStorage.getItem('chitchat_user_data'));
   console.log('Avatar URL:', user.avatar);
   ```

2. **Test the URL directly:**
   ```javascript
   // Try to fetch the image
   fetch(user.avatar).then(r => console.log('Image status:', r.status));
   ```

3. **Check Network Tab:**
   - Look for failed image requests
   - Check response codes (404, 500, etc.)
   - Verify request URLs

4. **Check Backend Logs:**
   - Look for static file requests
   - Check for any errors during file serving

### Expected Working Flow:

1. ✅ **Upload succeeds** → File saved to disk
2. ✅ **Database updated** → `avatar_url` field set
3. ✅ **URL transformed** → Relative → Full URL
4. ✅ **Frontend updated** → State + localStorage
5. ✅ **Image loads** → Browser can access file

## 🚀 Testing Commands

**Start servers with debugging:**
```bash
# Backend (enhanced with debugging)
cd backend && deno task dev

# Frontend 
cd frontend && npm run dev
```

**Test upload manually:**
1. Open browser dev tools
2. Upload a photo
3. Check console logs in both frontend and backend
4. Look for any error messages
5. Test image URL manually

**Run this in browser console after upload:**
```javascript
// Check current user data
const user = JSON.parse(localStorage.getItem('chitchat_user_data'));
console.log('User:', user);
console.log('Avatar URL:', user.avatar);

// Test image accessibility
if (user.avatar) {
  const img = new Image();
  img.onload = () => console.log('✅ Image loads successfully');
  img.onerror = () => console.log('❌ Image failed to load');
  img.src = user.avatar;
}
```

With all this debugging in place, we should be able to pinpoint exactly where the image upload process is failing! 🔍
