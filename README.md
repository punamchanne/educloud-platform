# EduCloud: AI-Powered Educational Admin System

EduCloud is a comprehensive school management platform built with the MERN stack. It leverages AI (Google Gemini) to automate and enhance various educational tasks, providing a seamless experience for administrators, teachers, students, and parents.

## 🚀 Key Features

### 🏫 Administrative Portal
*   **User Management**: Role-based access control for Admins, Teachers, Students, and Parents.
*   **Smart Timetable Generator**: AI-assisted scheduling for classes and teachers.
*   **Notification System**: Broadcast announcements and individual alerts.
*   **System Oversight**: Comprehensive dashboard for school-wide analytics.

### 👨‍🏫 Teacher Module
*   **AI Exam Generation**: Generate high-quality exam questions instantly using Google Gemini AI.
*   **Attendance Tracking**: Digital registers to manage student attendance.
*   **Result Management**: Input and analyze student performance data.

### 🎓 Student Portal
*   **Interactive Exams**: Secure, timed examination environment with full-screen enforcement.
*   **Auto-Timeout**: Automatic exam submission when the time limit is reached.
*   **Result Tracking**: Detailed breakdown of performance with AI-powered recommendations.
*   **EduBot**: An AI-powered chatbot to help with queries and learning.

### 👪 Parent Portal
*   **Child Monitoring**: Track child's attendance, results, and behavioral records.
*   **Teacher Interaction**: Direct communication channel with educators.
*   **Fee Management**: Overview of fee status and history.

## 🛠 Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, React Toastify.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose).
*   **AI Integration**: Google Generative AI (Gemini).
*   **Storage**: Cloudinary (for profile pictures).
*   **Mailing**: Nodemailer (for password recovery).

## 📋 Installation

### 1. Clone the repository
```bash
git clone https://github.com/road2tec/Educloud-.git
cd Educloud-
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## 🔒 Security Features
*   **JWT Authentication**: Secure user sessions.
*   **Password Hashing**: Bcrypt for storing passwords safely.
*   **Rate Limiting**: Protection against brute-force attacks.
*   **Input Sanitization**: Prevention of XSS and injection attacks.

## 📄 License
This project is licensed under the ISC License.
