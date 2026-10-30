import express from 'express';
import { loginUser, registerUser, forgotPassword, getUserProfile, getRegistrationDepartments } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);
router.get('/departments', getRegistrationDepartments);
router.get('/profile', protect, getUserProfile);

export default router;
