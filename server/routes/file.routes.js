import { Router } from "express";
import { upload } from "../utils/multer.js";
import {authenticateToken} from "../utils/middleware.js"
import { createFile , getAllFiles, getFile , renameFile, deleteFile} from "../controllers/file.controller.js";

const router = new Router();

router.post("/create", upload.fields([{ name: 'document', maxCount: 1 }]), authenticateToken, createFile);
router.get("/", upload.none(), authenticateToken, getAllFiles);
router.post("/", upload.none(), authenticateToken, getFile);
router.put('/', upload.none(), authenticateToken, renameFile);
router.delete('/', upload.none(), authenticateToken, deleteFile);


export default router;