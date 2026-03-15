// Test Data Setup Script for EduCloud
// Run this in MongoDB to create sample teacher and parent data

// Sample Teacher Data
db.users.insertOne({
  username: "teacher_john",
  email: "teacher@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2tq", // bcrypt hash for "password123"
  role: "teacher",
  profile: {
    fullName: "John Smith",
    phone: "+1234567890",
    address: "123 School Street"
  },
  createdAt: new Date()
});

const teacherUser = db.users.findOne({ email: "teacher@example.com" });

db.teachers.insertOne({
  user: teacherUser._id,
  employeeId: "T001",
  department: "Mathematics",
  subjects: ["Mathematics", "Algebra"],
  qualification: "M.Sc. Mathematics",
  experience: 5,
  joiningDate: new Date("2020-01-15"),
  assignedClasses: [
    {
      classId: ObjectId("507f1f77bcf86cd799439011"), // Sample class ID
      className: "10th Grade A",
      subject: "Mathematics",
      academicYear: "2024-2025"
    }
  ],
  schedule: [
    {
      day: "Monday",
      periods: [
        {
          subject: "Mathematics",
          className: "10th Grade A",
          startTime: "09:00",
          endTime: "10:00",
          room: "Room 101"
        }
      ]
    }
  ],
  status: "active"
});

// Sample Parent Data
db.users.insertOne({
  username: "parent_jane",
  email: "parent@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2tq", // bcrypt hash for "password123"
  role: "parent",
  profile: {
    fullName: "Jane Doe",
    phone: "+1234567890",
    address: "456 Home Street"
  },
  createdAt: new Date()
});

const parentUser = db.users.findOne({ email: "parent@example.com" });

db.parents.insertOne({
  user: parentUser._id,
  occupation: "Software Engineer",
  workplace: "Tech Corp",
  annualIncome: 75000,
  children: [
    {
      studentId: ObjectId("507f1f77bcf86cd799439012"), // Sample student ID
      relationship: "Mother",
      isPrimaryContact: true
    }
  ],
  status: "active"
});

// Sample Student Data
db.users.insertOne({
  username: "student_alex",
  email: "student@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2tq", // bcrypt hash for "password123"
  role: "student",
  profile: {
    fullName: "Alex Johnson",
    phone: "+1234567891",
    address: "456 Home Street"
  },
  createdAt: new Date()
});

const studentUser = db.users.findOne({ email: "student@example.com" });

db.students.insertOne({
  user: studentUser._id,
  studentId: "S001",
  academicInfo: {
    class: ObjectId("507f1f77bcf86cd799439011"), // Same class as teacher
    className: "10th Grade A",
    section: "A",
    rollNumber: "1",
    admissionDate: new Date("2024-06-01")
  },
  performance: {
    overallGPA: 3.8,
    subjects: [
      {
        subject: "Mathematics",
        grade: "A",
        score: 95,
        credits: 4
      }
    ]
  },
  status: "active"
});

// Sample Class Data
db.classes.insertOne({
  className: "10th Grade A",
  grade: "10th",
  section: "A",
  academicYear: "2024-2025",
  classTeacher: ObjectId("507f1f77bcf86cd799439011"), // Teacher ID
  students: [ObjectId("507f1f77bcf86cd799439012")], // Student ID
  statistics: {
    totalStudents: 1,
    averageAttendance: 95,
    averageGPA: 3.8
  },
  settings: {
    maxStudents: 40,
    isActive: true
  }
});

print("Sample data created successfully!");
print("Teacher: teacher@example.com / password123");
print("Parent: parent@example.com / password123");
print("Student: student@example.com / password123");