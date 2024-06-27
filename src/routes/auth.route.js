import express from 'express';

import AuthController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.mdw.js';
import { validateMdw } from '../middlewares/validate.mdw.js';
import AuthValidator from '../valdationSchema/auth.validator.js';
import { sendVerifyMail } from '../controllers/mail.controller.js';

const router = express.Router();

router.post('/login', validateMdw(AuthValidator.loginSchema), AuthController.login);
router.post('/signup', validateMdw(AuthValidator.signupSchema), AuthController.signup);
router.post('/verify-google-account', AuthController.verifyGoogleAccount);
router.get('/current-user', authMiddleware, AuthController.fetchCurrentUser);
router.get('/find-user', authMiddleware, AuthController.getUserByNameOrId);
router.post('/verify-mail', sendVerifyMail);
export default router;
