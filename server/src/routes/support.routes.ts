import { Router } from "express";
import { supportChat } from "../controllers/supportChat.controller";
import { submitContactForm } from "../controllers/contact.controller";

const router = Router();

router.post("/chat", supportChat);
router.post("/contact", submitContactForm);

export default router;
