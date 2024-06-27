import express from 'express';
import authMiddleware from '../middlewares/auth.mdw.js';
import RecordController from '../controllers/record.controller.js';

const router = express.Router();

router.post('/', authMiddleware, RecordController.create);
router.put('/:id', authMiddleware, RecordController.updateRecord);
router.get('/test/:id', authMiddleware, RecordController.getRecordByTestId);
router.post('/:id', RecordController.getRecordById);

export default router;
