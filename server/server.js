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
import { access } from "fs";

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
      res.send({ access: true, token: token });
    }
  );
});

app.post("/checkUser", async (req, res) => {
  let mailId = req.body.mail;
  let password = req.body.password;
  let exists = false;
  let actualPassword;
  let firstname;
  let lastname;
  let id;
  db.query(
    "select * from userinfo where mailid = ?",
    [mailId],
    async (err, data) => {
      if (err) return res.send(err);
      if (data.length) {
        exists = true;
        actualPassword = data[0].password;
        firstname = data[0].firstname;
        lastname = data[0].lastname;
        id = data[0].id;
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
              console.log(data);
              res.send({
                access: true,
                token: token,
                firstname: firstname,
                lastname: lastname,
                userId: id,
              });
            }
          );
        } else {
          res.send({ access: false });
        }
      }
    }
  );
});

app.post("/authenticateuser", async (req, res) => {
  const mailId = req.body.mail;
  const token = req.body.token;
  db.query(
    "select * from userinfo where mailid = ?",
    mailId,
    async (err, data) => {
      if (err) return err;
      const actualToken = data[0].token;
      if (actualToken === token) {
        res.send({ code: true, data });
      } else {
        res.send({ code: true });
      }
    }
  );
});

app.post("/checkauthorized", async (req, res) => {
  const mail = req.body.mail;
  const token = req.body.token;
  db.query("select token from userinfo where mailid = ?", mail, (err, data) => {
    if (err) res.send(err);
    if (data[0].token === token) {
      db.query("select * from cart where mailid = ?", mail, (err, data) => {
        if (err) res.send(err);
        res.send(data);
      });
    }
  });
});

app.post("/getcartitems", (req, res) => {
  const mailId = req.body.mailId;
  db.query("select * from cart where mailid = ?", mailId, (err, data) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log("select * cart items data ->", data);
    res.send(data);
  });
});

app.post("/addtocart", (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const price = req.body.price;
  const discount = req.body.discount;
  const mailId = req.body.mailId;
  const values = [mailId, id, title, price, discount];
  db.query(
    "insert into cart (mailid, productid, title, price, discount) values (?)",
    [values],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      console.log(data);
      res.send(data);
    }
  );
});

app.delete("/removecartitem", (req, res) => {
  const id = req.body.id;
  db.query("delete from cart where id = ?", id, (err, data) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log("delete cart item data ->", data);
    res.send(data);
  });
});

app.post("/getfromwish", (req, res) => {
  const mailId = req.body.mailId;
  db.query("select * from wishlists where mailid = ?", mailId, (err, data) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log("select * from wishlists data ->", data);
    res.send(data);
  });
});

app.post("/addtowish", (req, res) => {
  const values = [req.body.id, req.body.title, req.body.mailId];
  db.query(
    "insert into wishlists (productid, title, mailid) values (?)",
    [values],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      console.log("insert into wishlist data ->", data);
      res.send(data);
    }
  );
});

app.delete("/removefromwish", (req, res) => {
  const id = req.body.id;
  db.query("delete from wishlists where id = ?", id, (err, data) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log("remove from wishlist data ->", data);
    res.send(data);
  });
});

app.post("/getorders", (req, res) => {
  let mail = req.body.mail;
  db.query("select * from orders where mailid = ?", mail, (err, data) => {
    if (err) return res.send(err);
    return res.send(data);
  });
});

app.post("/placeorder", (req, res) => {
  let mail = req.body.mail;
  console.log(mail);
  db.query(
    "select productid, title, price, discount from cart where mailid = ?",
    mail,
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      console.log("cart data->", data);
      data.map((data) => {
        let values = [
          mail,
          data.productid,
          data.title,
          data.price,
          data.discount,
        ];
        db.query(
          "insert into orders (mailid, productid, title, price, discount) values (?)",
          [values],
          (err, data) => {
            if (err) {
              console.log(err);
              return res.send(err);
            }
            console.log("insert data ->", data);
          }
        );
      });
    }
  );
  db.query("delete from cart where mailid = ?", mail, (err, data) => {
    if (err) return res.send(err);
    console.log(data);
    res.send(data);
  });
});

app.post("/getaddress", (req, res) => {
  db.query(
    "select * from address where usermail = ?",
    req.body.mail,
    (err, data) => {
      if (err) return res.send(err);
      res.send(data);
    }
  );
});

app.post("/addaddress", (req, res) => {
  const values = [
    req.body.mail,
    req.body.name,
    req.body.house,
    req.body.street,
    req.body.landmark,
    req.body.city,
    req.body.state,
    req.body.country,
  ];
  db.query(
    "insert into address (usermail, addressname, house, street, landmark, city, state, country) values (?)",
    [values],
    (err, data) => {
      if (err) return res.send(err);
      res.send(data);
    }
  );
});

app.post("/getproduct", (req, res) => {
  const id = req.body.id;
  db.query("select * from products where id = ?", id, (err, data) => {
    if (err) return res.send(err);
    return res.send(data);
  });
});

app.post("/getproducts", (req, res) => {
  const category = req.body.category;
  db.query(
    "select * from products where category = ?",
    category,
    (err, data) => {
      if (err) {
        console.log(err);
        return req.send(err);
      }
      console.log("select * from products data ->", data);
      res.send(data);
    }
  );
});

app.post("/addproduct", async (req, res) => {
  // Adding values to DB
  const values = [
    req.body.title,
    Number(req.body.price),
    Number(req.body.discount),
    req.body.category,
    // key,
  ];
  db.query(
    // "insert into products (title, price, discount, category, imageTag) values (?)",
    "insert into products (title, price, discount, category) values (?)",
    [values],
    (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("insert into products data ->", data);
      res.send(
        data
      ); /* Remove this when adding image to bucket to send url to client but not this data */
    }
  );

  // Adding photo to S3 bucket and sending putobject-signed-url to client

  /* const code = random();
  const type = req.body.type.split("/")[1];
  const key = code + "." + type;
  console.log(key);

  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: req.body.type,
  };

  const command = new PutObjectCommand(params);
  const url = await getSignedUrl(s3, command);
  console.log(url);
  res.send(url); */
});

app.get("/getallcategories", async (req, res) => {
  db.query("select * from category", (err, data) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log("select * from categories data ->", data);
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
