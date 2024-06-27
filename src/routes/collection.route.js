import express from 'express';
import { validateMdw } from '../middlewares/validate.mdw.js';
import authMiddleware from '../middlewares/auth.mdw.js';
import CollectionValidator from '../valdationSchema/collection.validator.js';
import CollectionController from '../controllers/collection.controller.js';

const router = express.Router();

router.post(
  '/',
  validateMdw(CollectionValidator.createSchema),
  authMiddleware,
  CollectionController.create
);

router.get('/mine', authMiddleware, CollectionController.getMyCollections);

export default router;
