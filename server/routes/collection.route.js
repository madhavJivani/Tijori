import { Router } from 'express'
import {createCollection,renameCollection,getCollection,deleteCollection, getAllCollections} from '../controllers/collection.controller.js';
import { authenticateToken } from '../utils/middleware.js';
import { upload } from '../utils/multer.js';

const router = new Router();

router.post('/create', upload.none(), authenticateToken, createCollection);
router.get('/', upload.none(), authenticateToken, getAllCollections);
router.post('/', upload.none(), authenticateToken, getCollection);
router.put('/', upload.none(), authenticateToken, renameCollection);
router.delete('/', upload.none(), authenticateToken, deleteCollection);

export default router;