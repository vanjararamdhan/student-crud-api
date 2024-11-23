const Student = require('../models/studentModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT tokens
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Register a new student
exports.registerStudent = asyncHandler(async (req, res) => {
  const { name, email, phone, address, dob, subjects, password } = req.body;

  // Validate the name
  if (!name || name.length < 3) {
    return res.status(400).json({
      success: false,
      code: 110,
      message: 'Name must be at least 3 characters long.'
    });
  }

  // Validate email format (basic email validation using regex)
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      code: 111, // Invalid email format
      message: 'Please provide a valid email address.'
    });
  }

  // Check if student already exists with the given email
  const studentExists = await Student.findOne({ email });
  if (studentExists) {
    return res.status(400).json({
      success: false,
      code: 101, // Student already exists
      message: 'Student already exists with this email.'
    });
  }

  // Validate password
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      code: 112, // Invalid password length
      message: 'Password must be at least 6 characters long.'
    });
  }

  // Create a new student record
  const student = new Student({
    name,
    email,
    phone,
    address,
    dob,
    subjects,
    password
  });

  try {
    // Save the new student to the database
    const newStudent = await student.save();
    
    // Send success response
    res.status(201).json({
      success: true,
      code: 200,
      message: 'Student registered successfully.',
      data: newStudent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      code: 102,
      message: `Error while creating student: ${error.message}`
    });
  }
});

// Login student
exports.loginStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email });
  if (!student) {
    return res.status(404).json({
      success: false,
      code: 113, // Student not found
      message: 'Student with this email does not exist.'
    });
  }

  if (!(await bcrypt.compare(password, student.password))) {
    return res.status(401).json({
      success: false,
      code: 114, // Invalid password
      message: 'Incorrect password. Please check and try again.'
    });
  }

  const accessToken = generateAccessToken(student._id);
  const refreshToken = generateRefreshToken(student._id);

  res.status(200).json({
    success: true,
    code: 200,
    message: 'Login successful.',
    accessToken,
    refreshToken
  });
});

// Get all students' data
exports.getStudentsData = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default values: page = 1, limit = 10

  // Ensure `page` and `limit` are valid integers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
    return res.status(400).json({
      success: false,
      code: 107,
      message: 'Invalid pagination parameters. Page and limit must be positive integers.'
    });
  }

  try {
    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch the students with pagination
    const students = await Student.find()
      .select('-password') // Exclude sensitive fields like password
      .skip(skip)
      .limit(limitNumber);

    // Count the total number of documents in the collection
    const totalStudents = await Student.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalStudents / limitNumber);

    // If the page exceeds total pages, return an error
    if (pageNumber > totalPages) {
      return res.status(404).json({
        success: false,
        code: 108,
        message: 'Page not found. Requested page exceeds total number of pages.'
      });
    }

    // Send paginated response
    res.status(200).json({
      success: true,
      code: 200,
      message: 'Fetched students data successfully.',
      data: {
        students,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalStudents,
          limit: limitNumber
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      code: 109,
      message: `Error fetching students: ${error.message}`
    });
  }
});


// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, dob, password } = req.body;

  const student = await Student.findById(req.user.id);
  if (!student) {
    return res.status(404).json({
      success: false,
      code: 104, // Numeric code for "Student not found"
      message: 'Student not found',
    });
  }

  // Update fields if provided
  if (name) student.name = name;
  if (phone) student.phone = phone;
  if (address) student.address = address;
  if (dob) student.dob = dob;

  // Only update the password if explicitly provided
  if (password) {
    const isPasswordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    if (!isPasswordStrong) {
      return res.status(400).json({
        success: false,
        code: 109, // Numeric code for password validation failure
        message: 'Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character',
      });
    }
    student.password = await bcrypt.hash(password, 10);
  }

  try {
    const updatedStudent = await student.save();
    res.status(200).json({
      success: true,
      code: 200, // Numeric code for success
      message: 'Student profile updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({
      success: false,
      code: 500, // Numeric code for server error
      message: `Error updating student profile: ${error.message}`,
    });
  }
});



// Refresh access token
exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      code: 105,
      message: 'Refresh token is required. Please provide the refresh token.'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Access token refreshed successfully.',
      accessToken
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      code: 106,
      message: `Invalid or expired refresh token. Error: ${error.message}`
    });
  }
});
