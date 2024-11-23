const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');

// Regular expression for general email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Define the schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    match: [/^[A-Za-z\s]+$/, 'Name must only contain alphabets']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [emailRegex, 'Invalid email format'] // Validate all kinds of valid email formats
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must contain exactly 10 digits']
  },
  address: {
    type: String
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function (value) {
        const ageDiffMs = Date.now() - value.getTime();
        const ageDate = new Date(ageDiffMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970) >= 10; // Minimum 18 years old
      },
      message: 'Student must be at least 10 years old'
    }
  },
  subjects: [
    {
      subjectName: {
        type: String,
        enum: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English']
      },
      marks: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  ],
  password: {
    type: String,
    required: [true, 'Password is required for registration'],
    validate: {
      validator: function (value) {
        // Apply validation only if the password is set or modified
        if (this.isModified('password')) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
        }
        return true; // Skip validation if the password field is not being modified
      },
      message:
        'Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character',
    },
  },
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
