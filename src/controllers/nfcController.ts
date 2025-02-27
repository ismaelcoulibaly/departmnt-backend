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

    const response: NfcResponse = {
      message: "NFC verified",
      nfcTag,
    };

    if (nfcTag.linked_product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", nfcTag.linked_product_id)
        .single();

      if (product) response.product = product;
    }

    if (nfcTag.linked_user_id) {
      const { data: user } = await supabase
        .from("users")
        .select("id, email, first_name, last_name")
        .eq("id", nfcTag.linked_user_id)
        .single();

      if (user) response.owner = user;
    }

    res.json(response); 
  } catch (error) {
    console.error("NFC Verification Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
