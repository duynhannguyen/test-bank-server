import express from 'express';
import userProfile from '../controllers/userProfile.controller.js';
import authMiddleware from '../middlewares/auth.mdw.js';
import uploadMdw from '../middlewares/upload.mdw.js';
const router = express.Router();

router.put(
  '/:id/upload-profileimg',
  authMiddleware,
  uploadMdw.single('picture'),
  userProfile.uploadProfileImage
);
router.put('/:id/update-profile', authMiddleware, userProfile.editProfileUser);

export default router;
