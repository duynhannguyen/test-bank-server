import express from 'express';
import home from '../controllers/homeSearch.controller.js';

const router = express.Router();

router.post('/', home.homeSearch);

export default router;
