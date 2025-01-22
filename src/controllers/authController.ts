import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../supabase/supabaseClient.js";

const SECRET = process.env.JWT_SECRET || "default_secret";

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user: newUser });
  } catch (error: any) {
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (error) {
      throw new Error(error.message);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (error: any) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
