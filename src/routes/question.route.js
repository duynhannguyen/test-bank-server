import express from 'express';
import { validateMdw } from '../middlewares/validate.mdw.js';
import QuestionValidator from '../valdationSchema/question.validator.js';
import QuestionController from '../controllers/question.controller.js';
import authMiddleware from '../middlewares/auth.mdw.js';

const router = express.Router();

router.post(
  '/choice',
  validateMdw(QuestionValidator.questionSchema),
  authMiddleware,
  QuestionController.createMultipleChoice
);

router.post('/inital', authMiddleware, QuestionController.initalQuestion);

router.get('/mine', authMiddleware, QuestionController.getMyQuestions);

router.get('/:id', QuestionController.getQuestionById);

router.delete('/:id', authMiddleware, QuestionController.deleteQuestionById);

router.put('/:id', authMiddleware, QuestionController.updateQuestion);

export default router;
