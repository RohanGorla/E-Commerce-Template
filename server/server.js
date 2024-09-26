import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import nodemailer from "nodemailer";
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
        res.send({ code: false });
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

app.post("/getwishlists", (req, res) => {
  let mailId = req.body.mailId;
  db.query(
    "select * from wishlists where mailid = ?",
    [mailId],
    (err, data) => {
      if (err) return res.send(err);
      res.send(data);
    }
  );
});

app.post("/addwishlist", (req, res) => {
  let mailId = req.body.mailId;
  let listName = req.body.wishlistname;
  db.query(
    "insert into wishlists (mailid, wishlistname) values(?)",
    [[mailId, listName]],
    (err, data) => {
      if (err) return res.send(err);
      console.log(data);
    }
  );
  db.query(
    "select * from wishlists where mailid = ?",
    [mailId],
    (err, data) => {
      if (err) return res.send(err);
      res.send(data);
    }
  );
});

app.post("/getfromwish", (req, res) => {
  const mailId = req.body.mailId;
  db.query(
    "select * from wishlistitems where mailid = ?",
    mailId,
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      console.log("select * from wishlistitems data ->", data);
      res.send(data);
    }
  );
});

app.post("/addtowish", (req, res) => {
  const values = [
    req.body.id,
    req.body.title,
    req.body.mailId,
    req.body.price,
    req.body.discount,
    req.body.wishlist,
  ];
  db.query(
    "insert into wishlistitems (productid, title, mailid, price, discount, wishlistname) values (?)",
    [values],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      console.log("insert into wishlistitems data ->", data);
      res.send(data);
    }
  );
});

app.delete("/removefromwish", (req, res) => {
  const id = req.body.id;
  db.query("delete from wishlistitems where id = ?", id, (err, data) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log("remove from wishlistitems data ->", data);
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
        return res.send(err);
      }
      console.log("select * from products data ->", data);
      res.send(data);
    }
  );
});

app.post("/getreviews", (req, res) => {
  const id = req.body.id;
  db.query("select * from reviews where productid = ?", id, (err, data) => {
    if (err) return res.send(err);
    console.log(data);
    res.send({ data, code: true });
  });
});

app.post("/addreview", (req, res) => {
  let values = [req.body.id, req.body.mail, req.body.user, req.body.review];
  db.query(
    "insert into reviews (productid, mailid, username, review) values (?)",
    [values],
    (err, data) => {
      if (err) return res.send(err);
      console.log(data);
    }
  );
  db.query(
    "select * from reviews where productid = ?",
    req.body.id,
    (err, data) => {
      if (err) return res.send(err);
      console.log(data);
      res.send({ data: data, code: true });
    }
  );
});

app.put("/editusername", (req, res) => {
  const first = req.body.firstname;
  const last = req.body.lastname;
  const mail = req.body.usermail;
  db.query(
    "update userinfo set ? where mailId = ?",
    [{ firstname: first, lastname: last }, mail],
    (err, data) => {
      if (err)
        return res.send({ access: false, error: "Some error occurred!" });
      res.send({ access: true });
    }
  );
});

app.post("/getemailchangeotp", (req, res) => {
  const mailId = req.body.mail;
  db.query(
    "select mailid from userInfo where mailid = ?",
    [mailId],
    (err, data) => {
      if (err)
        return res.send({ access: false, error: "Some error occurred!" });
      if (data.length) {
        res.send({
          access: false,
          error: "Email is already linked with another account!",
        });
      } else {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: true,
          auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASS,
          },
        });

        async function sendmail() {
          const OTP = await crypto.randomInt(100000, 999999);
          transporter.sendMail({
            to: mailId,
            subject: "Sending Email using Node.js",
            html: `Your OTP is ${OTP}`,
          });
          res.send({ access: true, otp: OTP });
        }
        sendmail();
      }
    }
  );
});

app.put("/editusermail", (req, res) => {
  const newmail = req.body.newmail;
  const token = req.body.token;
  db.query(
    "update userinfo set ? where token = ?",
    [{ mailid: newmail }, token],
    (err, data) => {
      if (err)
        return res.send({ access: false, error: "Some error occurred!" });
      res.send({ access: true });
    }
  );
});

app.put("/edituserpassword", (req, res) => {
  const mail = req.body.mail;
  const token = req.body.token;
  const oldPassword = req.body.old;
  const newPassword = req.body.new;
  db.query(
    "select password from userinfo where mailid = ?",
    [mail],
    async (err, data) => {
      if (err)
        return res.send({ access: false, error: "Some error occurred!" });
      console.log(data[0].password);
      let correct = await bcrypt.compare(oldPassword, data[0].password);
      if (correct) {
        let newPasswordToken = await bcrypt.hash(newPassword, 10);
        db.query(
          "update userinfo set ? where token = ?",
          [{ password: newPasswordToken }, token],
          (err, data) => {
            if (err)
              return res.send({ access: false, error: "Some error occurred!" });
            res.send({ access: true });
          }
        );
      } else {
        res.send({ access: false, error: "Oldpassword incorrect!" });
      }
    }
  );
});

app.get("/getcatandcom", async (req, res) => {
  let catData;
  let comData;
  db.query("select distinct category from Category", (err, data) => {
    if (err) return res.send(err);
    catData = data;
    db.query("select distinct company from company", (err, data) => {
      if (err) return res.send(err);
      comData = data;
      console.log(catData, comData);
      res.send({ cat: catData, com: comData });
    });
  });
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

app.post("/addproduct", async (req, res) => {
  // Adding values to DB
  const values = [
    req.body.title,
    Number(req.body.price),
    Number(req.body.discount),
    req.body.category,
    req.body.company,
    // key,
  ];
  db.query(
    // "insert into products (title, price, discount, category, imageTag) values (?)",
    "insert into products (title, price, discount, category, company) values (?)",
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

app.post("/addcompany", async (req, res) => {
  const company = req.body.company;
  db.query(
    "insert into company (company) values (?)",
    [company],
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
