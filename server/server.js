import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;

const db = mysql.createConnection({
  database: process.env.DATABASE,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.DBPORT,
});

db.connect((err) => {
  if (err) console.log(err);
  console.log("Database connected");
});

app.get("/", (req, res) => {
    res.json("Listening...");
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
