import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import r from "./routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(r);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

