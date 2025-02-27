import { Request, Response } from "express";
import { supabase } from "../supabase/supabaseClient";

interface NfcResponse {
  message: string;
  nfcTag?: any;
  product?: any;
  owner?: any;
}

export const verifyNfc = async (req: Request, res: Response<NfcResponse>): Promise<void> => {
    const { nfc_uid } = req.params;
  
    try {
      const { data: nfcTag, error } = await supabase
        .from("nfc_tags")
        .select("*")
        .eq("nfc_uid", nfc_uid)
        .single();
  
      if (error || !nfcTag) {
        res.status(404).json({ message: "NFC tag not registered" });
        return;
      }
  
      if (!nfcTag.linked_user_id) {
        res.redirect(`https://your-flutterflow-app.com/login?uid=${nfc_uid}`);
        return;
      }
  
      switch (nfcTag.type) {
        case "LNK-UP":
          res.redirect(`https://your-api.com/lnk-up/${nfcTag.linked_user_id}`);
          return;
        case "EXTERNAL":
          res.redirect(nfcTag.external_url);
          return;
        case "INTERNAL":
          res.redirect(`https://your-flutterflow-app.com/content/${nfcTag.linked_product_id}`);
          return;
        case "DEPT_IDENTITY":
          res.redirect(`https://your-flutterflow-app.com/product/${nfcTag.linked_product_id}`);
          return;
        default:
          res.status(400).json({ message: "Unknown NFC type" });
          return;
      }
    } catch (error) {
      console.error("NFC Verification Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  


export const claimNfc = async (req: Request, res: Response) => {
    const { nfc_uid, user_id } = req.body;
  
    try {
      const { data: nfcTag, error } = await supabase
        .from("nfc_tags")
        .select("linked_user_id")
        .eq("nfc_uid", nfc_uid)
        .single();
  
      if (error || !nfcTag) {
        return res.status(404).json({ message: "NFC tag not found" });
      }
  
      if (nfcTag.linked_user_id) {
        return res.status(400).json({ message: "NFC tag already claimed" });
      }
  
      await supabase
        .from("nfc_tags")
        .update({ linked_user_id: user_id })
        .eq("nfc_uid", nfc_uid);
  
      return res.json({ message: "NFC tag claimed successfully" });
    } catch (error) {
      console.error("Claim NFC Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  