import express from 'express';
import user from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.mdw.js';

const router = express.Router();

router.get('/get-all-user', authMiddleware, user.getAllUser);
router.get('/get-user-stattics', authMiddleware, user.getStaticsNumber);
router.delete('/delete-user/:id', authMiddleware, user.deleteUser);

export default router;
