import express from 'express';
import studyGroup from '../controllers/studyGroup.controller.js';
import authMiddleware from '../middlewares/auth.mdw.js';

const router = express.Router();

router.get('/get-groups', authMiddleware, studyGroup.getGroupByUser);
router.post('/create-study-group', authMiddleware, studyGroup.createGroup);
router.delete('/delete-group/:id', authMiddleware, studyGroup.deleteGroup);
router.post('/add-members/:id', authMiddleware, studyGroup.addMemberToGroup);

export default router;
