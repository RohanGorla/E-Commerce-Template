import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

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

function random() {
  return crypto.randomBytes(32).toString("hex");
}

app.get("/", (req, res) => {
  db.query("select * from userinfo", (err, data) => {
    if (err) return res.send(err);
    res.send(data);
  });
});

app.post("/addUser", async (req, res) => {
  let hash = await bcrypt.hash(req.body.password, 10);
  let token = await bcrypt.hash(req.body.mail, 10);
  let values = [[req.body.first, req.body.last, req.body.mail, hash, token]];
  db.query(
    "insert into userinfo (firstname, lastname, mailid, password, token) values ?",
    [values],
    (err, data) => {
      if (err) return res.send(err);
      res.send(true);
    }
  );
});

app.post("/checkUser", async (req, res) => {
  let mailId = req.body.mail;
  let password = req.body.password;
  let exists = false;
  let actualPassword;
  db.query(
    "select mailid, password from userinfo where mailid = ?",
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
            "update userinfo set ? where mailId = ?",
            [{ token: token }, mailId],
            (err, data) => {
              if (err) return res.send(err);
              res.send(true);
            }
          );
        }
      }
    }
  );
});

app.post("/addtocart", (req, res) => {});

app.post("/addproduct", async (req, res) => {
  let code = random();
  const type = req.body.type.split("/")[1];
  const key = code + "." + type;
  console.log(key);

  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: req.body.type,
  };
  const command = new PutObjectCommand(params);
  let url = await getSignedUrl(s3, command);
  console.log(url);

  let values = [
    req.body.title,
    Number(req.body.price),
    Number(req.body.discount),
    req.body.category,
    key,
  ];
  db.query(
    "insert into products (title, price, discount, category, imageTag) values (?)",
    [values],
    (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(data);
    }
  );
  res.send(url);
});

app.get("/getallcategories", async (req, res) => {
  db.query("select * from category", (err, data) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log(data);
    res.send(data);
  });
});

app.post("/addcategory", async (req, res) => {
  const category = req.body.category;
  db.query(
    "insert into category (category) values (?)",
    [category],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      console.log(data);
      res.send("done");
    }
  );
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
