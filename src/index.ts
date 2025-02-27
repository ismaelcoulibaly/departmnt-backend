import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { CustomError } from "./types/customError";
import nfcRoutes from "./routes/nfcRoutes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/auth", authRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
    const err: CustomError = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
      error: {
        message: err.message
      }
    });
});

app.use("/nfc", nfcRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;