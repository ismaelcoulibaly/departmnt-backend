import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth";

dotenv.config();

const app = express();  require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.use("/auth", authRoutes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      error: {
        message: err.message
      }
    });
  });
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app;
