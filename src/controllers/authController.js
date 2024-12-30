import { Request, Response} from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


export const login = async {req: Request, res: Response} => {
    const {email, password} = req.body;

    try{
        const user = await querySupabaseForUser(email);
        if()
    }

}