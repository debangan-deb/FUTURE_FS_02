import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import r from "./routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(r);

app.listen(5000, () => console.log("Server running"));
