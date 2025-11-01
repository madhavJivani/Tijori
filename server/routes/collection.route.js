import { Router } from 'express'
import {createCollection,renameCollection,getCollection,deleteCollection, getAllCollections} from '../controllers/collection.controller.js';
import { authenticateToken } from '../utils/middleware.js';
const router = new Router();

router.post('/create', authenticateToken, createCollection);
router.get('/', authenticateToken, getAllCollections);
router.post('/', authenticateToken, getCollection);
router.put('/', authenticateToken, renameCollection);
router.delete('/', authenticateToken, deleteCollection);

export default router;