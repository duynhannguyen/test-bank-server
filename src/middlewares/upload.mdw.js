import { UnorderedBulkOperation } from 'mongodb';
import multer from 'multer';
import multerStorageConfig from '../config/multer.config.js';

const uploadMdw = multer({
  storage: multerStorageConfig
});

export default uploadMdw;
