import express from "express";
import "dotenv/config";
import connectDB from "./config/db";
import apiRouter from "./routes/api";
import cors from "cors";
 

const app = express();
// app.use(express.static("public"));
app.use(cors());

const port = process.env.PORT || 3002;
app.use("/", apiRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

connectDB();