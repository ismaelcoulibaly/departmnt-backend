import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../supabase/supabaseClient";
import { randomUUID } from "crypto";

const SECRET = process.env.JWT_SECRET || "default_secret";
const SALT_ROUNDS = 10;

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password, first_name, last_name, user_name, title, description, profile_image, is_GDC } = req.body;

  try {
    const { data: existingUsers, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email);

    if (userCheckError) {
      console.error("Error checking existing user:", userCheckError.message);
      res.status(500).json({ message: "Error checking existing user" });
      return;
    }

    if (existingUsers.length > 0) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const userId = randomUUID(); 

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error: dbError } = await supabase
      .from("users")
      .insert([
        {
          id: userId, 
          email,
          password: hashedPassword,  
          first_name,
          last_name,
          user_name,
          title,
          description,
          profile_image,
          is_GDC,
        },
      ])
      .select()
      .single();

    if (dbError) {
      res.status(400).json({ message: dbError.message });
      return;
    }

    const token = jwt.sign({ id: userId, email }, SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user: data });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};