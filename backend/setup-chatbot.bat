@echo off
REM EduCloud Chatbot Setup Script for Windows
echo 🤖 Setting up EduCloud AI Chatbot...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the backend directory
    exit /b 1
)

REM Install required dependencies
echo 📦 Installing dependencies...
call npm install @google/generative-ai joi

REM Check if data directory exists
if not exist "data" (
    echo 📁 Creating data directory...
    mkdir data
)

REM Verify required files exist
echo 🔍 Verifying chatbot files...

set missing_files=0

if not exist "controllers\chatbotController.js" (
    echo ❌ Missing: controllers\chatbotController.js
    set missing_files=1
)

if not exist "services\chatbotService.js" (
    echo ❌ Missing: services\chatbotService.js
    set missing_files=1
)

if not exist "routes\chatbotRoutes.js" (
    echo ❌ Missing: routes\chatbotRoutes.js
    set missing_files=1
)

if not exist "data\nlpIntents.json" (
    echo ❌ Missing: data\nlpIntents.json
    set missing_files=1
)

if not exist "middlewares\validation.js" (
    echo ❌ Missing: middlewares\validation.js
    set missing_files=1
)

if %missing_files% equ 1 (
    echo Please ensure all chatbot files are properly created.
    exit /b 1
)

REM Check environment variables
echo 🔧 Checking environment configuration...

if not exist ".env" (
    echo ⚠️  Warning: .env file not found. Please create one with the following variables:
    echo GEMINI_API_KEY=your_google_gemini_api_key
    echo MONGODB_URI=your_mongodb_connection_string
    echo JWT_SECRET=your_jwt_secret
    echo NODE_ENV=development
) else (
    findstr /C:"GEMINI_API_KEY" .env >nul
    if errorlevel 1 (
        echo ⚠️  Warning: GEMINI_API_KEY not found in .env file
        echo Please add: GEMINI_API_KEY=your_google_gemini_api_key
    )
)

echo 🎉 Chatbot setup completed!
echo.
echo Next steps:
echo 1. Ensure your .env file has the correct GEMINI_API_KEY
echo 2. Import chatbot routes in your server.js:
echo    import chatbotRoutes from './routes/chatbotRoutes.js';
echo    app.use('/api/chatbot', chatbotRoutes);
echo 3. Add the React Chatbot component to your frontend
echo 4. Test the chatbot at: https://p-educlud.onrender.com/api/chatbot-test/test
echo.
echo 📚 For detailed documentation, see CHATBOT_README.md

pause