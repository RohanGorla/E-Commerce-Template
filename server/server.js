import "dotenv/config";
import bcrypt from "bcrypt";
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
  db.query("select * from register", (err, data) => {
    if (err) return res.send(err);
    res.send(data);
  });
});

app.post("/addUser", async (req, res) => {
  let hash = await bcrypt.hash(req.body.password, 10);
  let token = await bcrypt.hash(req.body.mail, 10);
  let values = [[req.body.first, req.body.last, req.body.mail, hash, token]];
  db.query(
    "insert into register (firstname, lastname, mailid, password, token) values ?",
    [values],
    (err, data) => {
      if (err) return res.send(err);
      res.send(data);
    }
  );
});

app.post("/checkUser", async (req, res) => {
  let mailId = req.body.mail;
  let password = req.body.password;
  let exists = false;
  let actualPassword;
  db.query(
    "select mailid, password from register where mailid = ?",
    [mailId],
    async (err, data) => {
      if (err) return res.send(err);
      if (data) {
        exists = true;
        actualPassword = data[0].password;
      }
      if (exists) {
        let correct = await bcrypt.compare(password, actualPassword);
        if (correct) {
          let token = await bcrypt.hash(mailId, 10);
          db.query(
            "update register set ? where mailId = ?",
            [{ token: token }, mailId],
            (err, data) => {
              if (err) res.send(err);
            }
          );
        }
      }
    }
  );
});

app.post("/addtocart", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
