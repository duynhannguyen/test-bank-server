import express from 'express';
import authMiddleware from '../middlewares/auth.mdw.js';
import QuizRoomController from '../controllers/quizRoom.controller.js';
const router = express.Router();

router.post('/', authMiddleware, QuizRoomController.create);
router.put('/question/:id', authMiddleware, QuizRoomController.updateQuestion);
router.put('/answer/:id', QuizRoomController.updateAnswer);
router.get('/:id', QuizRoomController.getQuizRoomById);

export default router;
