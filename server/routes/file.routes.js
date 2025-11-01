import { Router } from "express";
// import { createFile,getFile,deleteFile  } from "../controllers/file.controller.js";
import {authenticateToken} from "../utils/middleware.js"
import { createFile , getAllFiles, getFile , renameFile, deleteFile} from "../controllers/file.controller.js";

const router = new Router();

router.post("/create", authenticateToken, createFile);
router.get("/", authenticateToken, getAllFiles);
router.post("/", authenticateToken, getFile);
router.put('/', authenticateToken, renameFile);
router.delete('/', authenticateToken, deleteFile);


export default router;