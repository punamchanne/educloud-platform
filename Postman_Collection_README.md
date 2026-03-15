# EduCloud Teachers & Parents API - Postman Collection

This Postman collection contains all the API endpoints for testing Teacher and Parent functionality in the EduCloud system.

## 📋 What's Included

### Teacher APIs
- **Authentication**: Login, Register, Profile
- **Dashboard**: Classes, Students, Exams, Schedule, Notifications, Performance

### Parent APIs
- **Authentication**: Login, Register, Profile
- **Dashboard**: Children Overview, Performance, Attendance, Notifications, Communication

### Health Check
- API server health status

## 🚀 How to Use

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select "File"
4. Choose `EduCloud_Teachers_Parents_Postman_Collection.json`
5. Click "Import"

### 2. Set Environment Variables
Create a new environment in Postman with these variables:
- `base_url`: `https://p-educlud.onrender.com` (your API server URL)
- `teacher_token`: (will be set after login)
- `parent_token`: (will be set after login)
- `class_id`: (ID of a class)
- `student_id`: (ID of a student)
- `teacher_id`: (ID of a teacher)
- `notification_id`: (ID of a notification)

### 3. Testing Flow

#### For Teachers:
1. **Register/Login** → Use "Teacher Login" or "Teacher Register"
2. **Set Token** → Copy the token from response and set it in `teacher_token` variable
3. **Test Endpoints** → All teacher dashboard endpoints will now work

#### For Parents:
1. **Register/Login** → Use "Parent Login" or "Parent Register"
2. **Set Token** → Copy the token from response and set it in `parent_token` variable
3. **Test Endpoints** → All parent dashboard endpoints will now work

## 📚 API Endpoints Summary

### Teacher Endpoints
```
POST   /api/auth/login                    - Teacher login
POST   /api/auth/register                 - Teacher registration
GET    /api/auth/profile                  - Get teacher profile
GET    /api/teachers/dashboard/classes    - Get assigned classes
GET    /api/teachers/dashboard/classes/:classId/students - Get class students
GET    /api/teachers/dashboard/students/:studentId - Get student details
GET    /api/teachers/dashboard/exams      - Get teacher exams
GET    /api/teachers/dashboard/classes/:classId/performance - Get class performance
GET    /api/teachers/dashboard/schedule   - Get teacher schedule
GET    /api/teachers/dashboard/notifications - Get notifications
POST   /api/teachers/dashboard/update-metrics - Update metrics
```

### Parent Endpoints
```
POST   /api/auth/login                    - Parent login
POST   /api/auth/register                 - Parent registration
GET    /api/auth/profile                  - Get parent profile
GET    /api/parents/dashboard/children    - Get children overview
GET    /api/parents/dashboard/children/:studentId/performance - Get child performance
GET    /api/parents/dashboard/children/:studentId/attendance - Get child attendance
POST   /api/parents/dashboard/contact-teacher - Contact teacher
GET    /api/parents/dashboard/notifications - Get notifications
PUT    /api/parents/dashboard/notifications/:id/read - Mark notification read
PUT    /api/parents/dashboard/preferences - Update preferences
```

## 🔧 Sample Data for Testing

### Teacher Registration Data:
```json
{
  "username": "teacher_john",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher",
  "fullName": "John Smith",
  "phone": "+1234567890",
  "address": "123 School Street"
}
```

### Parent Registration Data:
```json
{
  "username": "parent_jane",
  "email": "parent@example.com",
  "password": "password123",
  "role": "parent",
  "fullName": "Jane Doe",
  "phone": "+1234567890",
  "address": "456 Home Street"
}
```

## ⚠️ Important Notes

1. **Authentication Required**: Most endpoints require JWT tokens in the Authorization header
2. **Role-Based Access**: Teachers can only access teacher endpoints, Parents can only access parent endpoints
3. **Server Running**: Make sure your backend server is running on the specified port
4. **Database Setup**: Ensure MongoDB is connected and collections are properly set up

## 🐛 Troubleshooting

- **Validation Errors**: Make sure you're using the correct role values ('admin', 'staff', 'student', 'teacher', 'parent') and profile fields are properly formatted
- **404 Errors**: Check if the server is running and routes are properly mounted
- **401 Errors**: Verify JWT token is valid and not expired
- **403 Errors**: Check user role permissions
- **500 Errors**: Check server logs for detailed error information

## 📞 Support

If you encounter any issues with this collection, please check:

1. Backend server logs
2. Database connection
3. Environment variables
4. User roles and permissions
