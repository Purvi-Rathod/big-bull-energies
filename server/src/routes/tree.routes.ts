import { Router } from "express";
import { viewBinaryTree, getMyTree, getNodeDownlines } from "../controllers/tree.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Public route - view entire tree (admin only typically)
router.get("/view", viewBinaryTree);

// Protected route - user's own tree (downline)
router.get("/my-tree", requireAuth, getMyTree);

// Protected route - get downlines for a specific node (for lazy loading)
router.get("/node/:userId/downlines", requireAuth, getNodeDownlines);

export default router;

