import { Router } from "express";
import { verifyNfc } from "../controllers/nfcController";

const router = Router();

router.get("/verify/:nfc_uid", verifyNfc);

export default router;