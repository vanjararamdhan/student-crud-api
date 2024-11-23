const express = require('express');
const {
  registerStudent,
  loginStudent,
  getStudentsData,
  updateProfile,
  refreshAccessToken,
} = require('../controllers/studentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.get('/', authMiddleware, getStudentsData);
router.put('/profile', authMiddleware, updateProfile);
router.post('/refresh-token', refreshAccessToken);

module.exports = router;
