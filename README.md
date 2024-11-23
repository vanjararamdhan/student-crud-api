# Student CRUD API

This API enables basic CRUD operations for managing student data, including authentication and profile updates. It is built using **Express.js** and **MongoDB**.

---

## Features

- **Register**: Register a new student with necessary details.
- **Login**: Authenticate students and generate access and refresh tokens.
- **Retrieve**: Fetch all student records with pagination support.
- **Update**: Update student profile details.
- **Token Management**: Refresh access tokens using valid refresh tokens.

---

## Requirements

- **Node.js** (v14+ recommended)
- **MongoDB** (local or hosted instance)
- **npm** or **yarn**

---

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/student-crud-api.git
    cd student-crud-api
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables** in a `.env` file:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/studentDB
    JWT_SECRET=your_jwt_secret
    JWT_REFRESH_SECRET=your_refresh_secret
    ```

4. **Run the server**:
    - For development (using **nodemon**):
      ```bash
      npm run dev
      ```
    - For production:
      ```bash
      npm start
      ```

The API will be available at `http://localhost:5000`.

---

## API Endpoints

### **POST /api/auth/register**
Register a new student.

- **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@gmail.com",
      "phone": "9876543210",
      "address": "123 Main St, City",
      "dob": "2000-01-01",
      "subjects": [
        { "subjectName": "Math", "marks": 90 },
        { "subjectName": "Science", "marks": 85 }
      ],
      "password": "Strong@123"
    }
    ```

- **Response** (Success):
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Student registered successfully",
      "data": { ... }
    }
    ```

---

### **POST /api/auth/login**
Log in a student and generate tokens.

- **Request Body**:
    ```json
    {
      "email": "johndoe@gmail.com",
      "password": "Strong@123"
    }
    ```

- **Response**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Login successful",
      "accessToken": "JWT_ACCESS_TOKEN",
      "refreshToken": "JWT_REFRESH_TOKEN"
    }
    ```

---

### **GET /api/students**
Retrieve all students with pagination.

- **Query Parameters**:
  - `page` (default = 1): Page number.
  - `limit` (default = 10): Number of records per page.

- **Example**:
    ```
    GET /api/students?page=1&limit=5
    ```

- **Response**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Fetched all students successfully",
      "data": {
        "students": [...],
        "pagination": {
          "total": 50,
          "page": 1,
          "limit": 5,
          "totalPages": 10
        }
      }
    }
    ```

---

### **PUT /api/students/update**
Update a student's profile. Partial updates are allowed.

- **Request Body (example)**:
    ```json
    {
      "name": "Johnathan Doe",
      "phone": "9876543210",
      "address": "456 New St, New City"
    }
    ```

- **Response**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Student profile updated successfully",
      "data": { ... }
    }
    ```

---

### **POST /api/auth/refresh-token**
Refresh the access token using a valid refresh token.

- **Request Body**:
    ```json
    {
      "refreshToken": "JWT_REFRESH_TOKEN"
    }
    ```

- **Response**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Access token refreshed successfully",
      "accessToken": "NEW_JWT_ACCESS_TOKEN"
    }
    ```

---

## Validation Rules

1. **Name**: Only alphabets allowed.
2. **Email**: Supports all valid formats (e.g., `example@gmail.com`, `example@domain.com`).
3. **Phone**: Must be exactly 10 digits.
4. **Date of Birth (DOB)**: Must be 18 years or older.
5. **Password**: 
   - At least 8 characters.
   - Must include an uppercase letter, a lowercase letter, a number, and a special character.

---

## Pagination Example

When fetching students, the response includes a `pagination` object:
```json
{
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
