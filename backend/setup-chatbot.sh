#!/bin/bash

# EduCloud Chatbot Setup Script
echo "🤖 Setting up EduCloud AI Chatbot..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Install required dependencies
echo "📦 Installing dependencies..."
npm install @google/generative-ai joi

# Check if data directory exists
if [ ! -d "data" ]; then
    echo "📁 Creating data directory..."
    mkdir data
fi

# Verify required files exist
echo "🔍 Verifying chatbot files..."

required_files=(
    "controllers/chatbotController.js"
    "services/chatbotService.js"
    "routes/chatbotRoutes.js"
    "data/nlpIntents.json"
    "middlewares/validation.js"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    printf '%s\n' "${missing_files[@]}"
    echo "Please ensure all chatbot files are properly created."
    exit 1
fi

# Check environment variables
echo "🔧 Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one with the following variables:"
    echo "GEMINI_API_KEY=your_google_gemini_api_key"
    echo "MONGODB_URI=your_mongodb_connection_string"
    echo "JWT_SECRET=your_jwt_secret"
    echo "NODE_ENV=development"
else
    if ! grep -q "GEMINI_API_KEY" .env; then
        echo "⚠️  Warning: GEMINI_API_KEY not found in .env file"
        echo "Please add: GEMINI_API_KEY=your_google_gemini_api_key"
    fi
fi

# Test basic functionality
echo "🧪 Testing chatbot system..."

# Start the server in background for testing
echo "Starting server for testing..."
npm start &
server_pid=$!

# Wait for server to start
sleep 5

# Test health endpoint
if curl -f https://p-educlud.onrender.com/api/health >/dev/null 2>&1; then
    echo "✅ Server health check passed"
else
    echo "❌ Server health check failed"
fi

# Stop the test server
kill $server_pid 2>/dev/null

echo "🎉 Chatbot setup completed!"
echo ""
echo "Next steps:"
echo "1. Ensure your .env file has the correct GEMINI_API_KEY"
echo "2. Import chatbot routes in your server.js:"
echo "   import chatbotRoutes from './routes/chatbotRoutes.js';"
echo "   app.use('/api/chatbot', chatbotRoutes);"
echo "3. Add the React Chatbot component to your frontend"
echo "4. Test the chatbot at: https://p-educlud.onrender.com/api/chatbot-test/test"
echo ""
echo "📚 For detailed documentation, see CHATBOT_README.md"