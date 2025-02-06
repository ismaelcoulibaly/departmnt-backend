import { Router } from "express";
import { login, signup } from "../controllers/authController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed successfully" });
});

export default router;