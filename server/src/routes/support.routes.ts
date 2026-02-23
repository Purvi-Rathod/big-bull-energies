import { Router } from "express";
import { supportChat } from "../controllers/supportChat.controller";

const router = Router();

router.post("/chat", supportChat);

export default router;
