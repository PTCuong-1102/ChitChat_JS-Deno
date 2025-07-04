// Run this in your browser console after uploading an image

// 1. Check current user data
const userData = localStorage.getItem('chitchat_user_data');
if (userData) {
  const user = JSON.parse(userData);
  console.log('👤 Current user data:', user);
  console.log('🖼️ Avatar URL:', user.avatar);
  console.log('🖼️ Avatar URL (original):', user.avatar_url);
} else {
  console.log('❌ No user data found in localStorage');
}

// 2. Test image URL directly
async function testImageUrl(url) {
  try {
    const response = await fetch(url);
    console.log(`📡 Testing ${url}:`, response.status, response.statusText);
    if (response.ok) {
      console.log('✅ Image URL is accessible');
    } else {
      console.log('❌ Image URL not accessible');
    }
    return response.ok;
  } catch (error) {
    console.error('❌ Error testing image URL:', error);
    return false;
  }
}

// 3. Test the avatar URL if it exists
if (userData) {
  const user = JSON.parse(userData);
  if (user.avatar) {
    testImageUrl(user.avatar);
  }
}

// 4. Test various URL formats
const testUrls = [
  'http://127.0.0.1:8000/uploads/profiles/',
  'http://localhost:8000/uploads/profiles/',
  'http://127.0.0.1:8000/uploads/',
  'http://localhost:8000/uploads/'
];

console.log('🧪 Testing upload endpoints...');
testUrls.forEach(url => {
  testImageUrl(url);
});

// 5. Create a test image element to see what happens
function createTestImage(src) {
  const img = document.createElement('img');
  img.src = src;
  img.style.width = '50px';
  img.style.height = '50px';
  img.style.border = '2px solid blue';
  img.onload = () => console.log('✅ Test image loaded:', src);
  img.onerror = () => console.log('❌ Test image failed:', src);
  
  // Add to page temporarily for testing
  document.body.appendChild(img);
  
  // Remove after 5 seconds
  setTimeout(() => {
    document.body.removeChild(img);
  }, 5000);
  
  return img;
}

// Test the user's avatar if it exists
if (userData) {
  const user = JSON.parse(userData);
  if (user.avatar) {
    console.log('🖼️ Creating test image for avatar:', user.avatar);
    createTestImage(user.avatar);
  }
}
