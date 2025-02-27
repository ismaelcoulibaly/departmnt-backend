import { Router } from "express";
import { claimNfc, verifyNfc } from "../controllers/nfcController";

const router = Router();

router.get("/verify/:nfc_uid", verifyNfc);
router.post("/claim", claimNfc);


export default router;