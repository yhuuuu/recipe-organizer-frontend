# Frontend Debugging Guide

## ✅ Completed Changes

### 1. Added Backend API Calls
Created `src/services/backendExtractor.ts`, implementing:
- ✅ Call backend `/api/extract` endpoint
- ✅ Complete error handling and logging
- ✅ Network error detection
- ✅ CORS error detection
- ✅ Data validation and normalization

### 2. Updated AddRecipeModal.tsx
- ✅ Import `extractRecipeFromBackend` service
- ✅ Prioritize backend API call in `handleExtract`
- ✅ Prioritize backend API call in `handleExtractAndSave`
- ✅ Add detailed console logging
- ✅ Automatic fallback to local extraction on backend failure

### 3. Enhanced Logging
All key steps output logs in the browser console:
- 🔵 Blue: Indicates ongoing operation
- ✅ Green: Indicates successful operation
- ⚠️ Yellow: Indicates warning (fallback to alternative)
- ❌ Red: Indicates error

## 🔍 Browser Console Inspection Steps

### Step 1: Open Developer Tools
1. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Click the "Console" tab

### Step 2: Test Extraction Feature
1. Click "Add Recipe" in the app
2. Paste recipe content or enter URL
3. Click "AI Extract" or "AI Extract and Add"

### Step 3: View Console Output

#### ✅ Successful call should display:
```
🔵 Calling backend /api/extract...
Request data: { text: "...", url: "..." }
Response status: 200 OK
✅ Received from backend: { title: "...", ingredients: [...], steps: [...] }
✅ Normalized data: { ... }
🔵 Filling form with extracted data: { ... }
✅ Form data updated successfully
```

#### ❌ Common Error Types:

**1. Network Error - Backend Not Running**
```
❌ Network error - Backend might not be running: TypeError: Failed to fetch
Error message: Unable to connect to backend server, please ensure backend service is running (http://localhost:4000)
```
**Solution:**
- Ensure backend server is running at `http://localhost:4000`
- Check backend logs to confirm service has started

**2. CORS Error**
```
Access to fetch at 'http://localhost:4000/api/extract' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```
**Solution:**
Backend needs CORS configuration, for example (Node.js/Express):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**3. 404 Error - Endpoint Doesn't Exist**
```
Response status: 404 Not Found
❌ Backend API error: 404 Not Found
```
**Solution:**
- Check if backend implements `/api/extract` endpoint
- Confirm backend route configuration is correct

**4. 500 Error - Backend Server Error**
```
Response status: 500 Internal Server Error
❌ Backend API error: 500 Internal Server Error
```
**Solution:**
- Check backend logs for specific error
- Confirm data format received by backend is correct

### Step 4: Check Network Tab

1. Click "Network" tab
2. Refresh page or re-execute extraction
3. Look for request to `extract`

#### Check Request Details:
- **URL**: Should be `http://localhost:4000/api/extract`
- **Method**: POST
- **Status**: 200 (success)
- **Request Headers**: Should include `Content-Type: application/json`
- **Request Payload**: Should contain `{ text: "...", url: "..." }`
- **Response**: Should contain extracted recipe data

#### Common Issues:
- ❌ Request shows `(failed)`: Network connection issue or CORS error
- ❌ Status code 404: Backend endpoint doesn't exist
- ❌ Status code 500: Backend processing error
- ❌ Request not sent: Frontend code may have errors

## 🧪 Test Cases

### Test 1: Text Extraction
1. Click "Add Recipe"
2. Click "Paste Content" tab
3. Paste the following test content:
```
Home-style Hot and Sour Beef Soup

[Ingredients]
Beef, pickled vegetables, tofu

[Instructions]
1. Prepare ingredients
2. Cook soup base
3. Add beef
```
4. Click "AI Extract Recipe"
5. View console logs

**Expected Result:**
- Console displays backend call logs
- Form automatically fills title, ingredients, steps
- No error messages

### Test 2: URL Extraction
1. Click "Add Recipe"
2. Enter a recipe URL in "Recipe URL" input
3. Click "AI Extract"
4. View console logs

## 📋 Backend API Requirements

### Endpoint: POST /api/extract

**Request Format:**
```json
{
  "text": "Recipe text content (optional)",
  "url": "Recipe URL (optional)"
}
```

**Response Format:**
```json
{
  "title": "Recipe title",
  "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "cuisine": "Chinese",
  "image": "https://example.com/image.jpg"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## 🔧 Environment Configuration

### Create .env File
```bash
cp .env.example .env
```

### Configuration Content:
```
VITE_API_BASE_URL=http://localhost:4000/api
```

Ensure backend server is running at `http://localhost:4000`

## 📊 Data Flow Diagram

```
User input text/URL
       ↓
Click "AI Extract"
       ↓
handleExtract() function
       ↓
extractRecipeFromBackend(text, url)
       ↓
fetch('http://localhost:4000/api/extract', {...})
       ↓
Backend processing (AI/text parsing)
       ↓
Return JSON { title, ingredients, steps, cuisine, image }
       ↓
setFormData() fills form
       ↓
User can edit or save directly
```

## 🚨 Troubleshooting Checklist

- [ ] Is backend service running? (`http://localhost:4000`)
- [ ] Has backend implemented `/api/extract` endpoint?
- [ ] Has backend configured CORS?
- [ ] Does `.env` file exist and is it configured correctly?
- [ ] Are there errors in browser console?
- [ ] Does Network tab show the request?
- [ ] What is the request status code?
- [ ] Is the request and response data format correct?

## 📝 Next Steps

If you encounter issues:
1. Copy complete error message from console
2. Check Network tab request details
3. Check backend logs
4. Confirm data format meets API requirements
