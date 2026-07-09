E-Learning Platform
A full-stack web application that I built using the MERN Stack as part of my MCA final year project. The idea was to create a real-world learning platform where students can enroll in courses, instructors can manage their content, and admins can oversee the entire platform.

Why I Built This
I wanted to go beyond simple CRUD apps and build something that solves a real problem. This project helped me understand how role-based systems work in production applications and how to structure a full-stack app properly.

What It Can Do
If you are a Student:

Create an account and browse available courses
Enroll in courses and track your progress module by module
Leave ratings and reviews after completing a course
If you are an Instructor:

Register and wait for Admin approval before going live
Create and manage your own courses with video links and study materials
See how many students enrolled in your courses
If you are an Admin:

Approve or reject instructor registrations
Block users if needed
Have full visibility over all courses and users on the platform
Tech Stack
Frontend: React.js Tailwind CSS
Backend: Node.js with Express.js
Database: MongoDB with Mongoose
Auth: JWT tokens + Bcrypt for password hashing
API Testing: Postman
How to Run This Locally
Clone the project

git clone https://github.com/mihir-joshii/E-Learning-Platform.git
Run the backend

cd backend
npm install
nodemon server.js
Run the frontend

cd frontend
npm install
npm run dev
Set up your .env file in the backend folder

Create a .env file inside the /backend directory and add the following:

MONGO_URI=your_mongodb_connection_string JWT_SECRET=your_secret_key PORT=5000

What I Learned
How to build and connect a full REST API with React frontend
Implementing JWT authentication with protected routes
Designing role-based access control from scratch
Managing relational data in MongoDB using Mongoose
Built By
This project was collaboratively developed by:

Mihir Joshi

GitHub: github.com/mihir-joshii
LinkedIn: linkedin.com/in/mihirjoshi-mern-dev
Pratik Kothari

GitHub: github.com/pratik-kothari-dev
LinkedIn: linkedin.com/in/pratik-kothari-dev
We built this together as part of our academic journey, with the goal of creating something that goes beyond textbook knowledge and reflects real-world development.
