import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import express, { query } from "express";
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
import Razorpay from "razorpay";

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
  let firstname = req.body.first;
  let lastname = req.body.last;
  let mail = req.body.mail;
  let password = req.body.password;
  let exists = false;
  db.query(
    "select * from userinfo where mailid = ?",
    [mail],
    async (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg: "Some error has occurred!",
        });
      if (data.length) {
        exists = true;
      }
      if (exists) {
        res.send({
          access: false,
          errorMsg: "This email is already linked to an existing account!",
        });
      } else {
        let hash = await bcrypt.hash(password, 10);
        let token = await bcrypt.hash(mail, 10);
        let values = [[firstname, lastname, mail, hash, token]];
        db.query(
          "insert into userinfo (firstname, lastname, mailid, password, token) values ?",
          [values],
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg: "Someth error has occurred!",
              });
            res.send({ access: true, token: token });
          }
        );
      }
    }
  );
});

// In Login page

app.post("/checkUser", async (req, res) => {
  let mailId = req.body.mail;
  let password = req.body.password;
  let exists = false;
  let actualPassword;
  let firstname;
  let lastname;
  let id;
  let baseAddress;
  db.query(
    "select * from userinfo where mailid = ?",
    [mailId],
    async (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg: "Some error has occurred!",
        });
      if (data.length) {
        exists = true;
        actualPassword = data[0].password;
        firstname = data[0].firstname;
        lastname = data[0].lastname;
        id = data[0].id;
        baseAddress = data[0].base_address;
      }
      if (exists) {
        let correct = await bcrypt.compare(password, actualPassword);
        if (correct) {
          let token = await bcrypt.hash(mailId, 10);
          db.query(
            "update userinfo set ? where mailId = ?",
            [{ token: token }, mailId],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg: "Some error has occurred!",
                });
              console.log(data);
              db.query(
                "select * from address where addressname = ?",
                [baseAddress],
                (err, add) => {
                  if (err)
                    return res.send({
                      access: false,
                      errorMsg: "Some error has occurred",
                    });
                  res.send({
                    access: true,
                    token: token,
                    firstname: firstname,
                    lastname: lastname,
                    userId: id,
                    base_address: baseAddress,
                    baseAdd: add,
                  });
                }
              );
            }
          );
        } else {
          res.send({ access: false, errorMsg: "Password is incorrect!" });
        }
      } else {
        res.send({ access: false, errorMsg: "User doesnot exist!" });
      }
    }
  );
});

// In Account page

app.post("/authenticateuser", async (req, res) => {
  const mailId = req.body.mail;
  const token = req.body.token;
  db.query("select * from userinfo where mailid = ?", mailId, (err, data) => {
    if (err) return err;
    const actualToken = data[0].token;
    if (actualToken === token) {
      res.send({ code: true, data });
    } else {
      res.send({ code: false });
    }
  });
});

// In Checkout page

app.post("/checkauthorized", async (req, res) => {
  const mail = req.body.mail;
  const token = req.body.token;
  db.query("select token from userinfo where mailid = ?", mail, (err, data) => {
    if (err) res.send({ access: false, errorMsg: err });
    if (data[0].token === token) {
      db.query("select * from cart where mailid = ?", mail, (err, data) => {
        if (err) res.send({ access: false, errorMsg: err });
        res.send({ access: true, data: data });
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
  const itemCount = req.body.count;
  db.query(
    "select count from cart where productid = ? and mailid = ?",
    [id, mailId],
    (err, data) => {
      if (err) return res.send(err);
      if (data.length) {
        if (data[0].count === itemCount) {
          return res.send({
            access: false,
            errorMsg:
              "You already have this product with the same quantity in your cart!",
          });
        } else {
          db.query(
            "update cart set ? where productid = ? and mailid = ?",
            [{ count: itemCount }, id, mailId],
            (err, data) => {
              if (err) return res.send({ access: false, errorMsg: err });
              res.send({
                access: true,
                successMsg: "Successfully updated product quantity in cart!",
              });
            }
          );
        }
      } else {
        const values = [mailId, id, title, price, discount, itemCount];
        db.query(
          "insert into cart (mailid, productid, title, price, discount, count) values (?)",
          [values],
          (err, data) => {
            if (err) {
              return res.send({ access: false, errorMsg: err });
            }
            res.send({
              access: true,
              successMsg: "Product has been successfully added to your cart!",
            });
          }
        );
      }
    }
  );
});

app.put("/updatecartitemcount", (req, res) => {
  let cartData = req.body.cartData;
  let mail = req.body.mail;
  db.query("select * from cart where mailid = ?", mail, (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    let previousCart = data;
    for (let i = 0; i < previousCart.length; i++) {
      if (previousCart[i].count != cartData[i].count) {
        db.query(
          "update cart set ? where productid = ? and mailid = ?",
          [{ count: cartData[i].count }, cartData[i].productid, mail],
          (err, data) => {
            if (err) return res.send({ access: false, errorMsg: err });
          }
        );
      }
    }
    res.send({ access: true });
  });
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

app.delete("/deletewishlist", (req, res) => {
  let list = req.body.list;
  let mail = req.body.mail;
  db.query(
    "delete from wishlists where wishlistname = ? and mailid = ?",
    [list, mail],
    (err, data) => {
      if (err) return res.send({ access: false });
      db.query(
        "delete from wishlistitems where wishlistname = ? and mailid = ?",
        [list, mail],
        (err, data) => {
          if (err) return res.send({ access: false });
          res.send({ access: true });
        }
      );
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
    "select * from wishlistitems where mailid = ? and wishlistname = ? and productid = ?",
    [req.body.mailId, req.body.wishlist, req.body.id],
    (err, data) => {
      if (err) return res.send({ access: false, errorMsg: err });
      if (data.length) {
        res.send({
          access: false,
          errorMsg: `You already have this product in ${req.body.wishlist}!`,
        });
      } else {
        db.query(
          "insert into wishlistitems (productid, title, mailid, price, discount, wishlistname) values (?)",
          [values],
          (err, data) => {
            if (err) {
              console.log(err);
              return res.send(err);
            }
            res.send({
              access: true,
              successMsg: `Product has been successfully added to ${req.body.wishlist}`,
            });
          }
        );
      }
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

app.post("/buyproduct", (req, res) => {
  let productData = req.body.product;
  let mail = req.body.mail;
  let count = req.body.count;
  let values = [
    mail,
    productData.id,
    productData.title,
    productData.price,
    productData.discount,
    count,
  ];
  db.query("select id from buy where mailid = ?", mail, (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    if (data.length) {
      db.query("delete from buy where mailid = ?", mail, (err, data) => {
        if (err) return res.send({ access: false, errorMsg: err });
        db.query(
          "insert into buy (mailid, productid, title, price, discount, count) values (?)",
          [values],
          (err, data) => {
            if (err) return res.send({ access: false, errorMsg: err });
            res.send({ access: true });
          }
        );
      });
    } else {
      db.query(
        "insert into buy (mailid, productid, title, price, discount, count) values (?)",
        [values],
        (err, data) => {
          if (err) return res.send({ access: false, errorMsg: err });
          res.send({ access: true });
        }
      );
    }
  });
});

app.post("/getbuyproduct", (req, res) => {
  const mail = req.body.mail;
  db.query("select * from buy where mailid = ?", mail, (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    return res.send({ access: true, data: data });
  });
});

app.post("/initiatebuypayment", (req, res) => {
  let mail = req.body.mail;
  db.query("select * from buy where mailid = ?", mail, async (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    let cost = data[0].price * (1 - data[0].discount / 100);
    let total = cost * data[0].count;
    let totalAmount;
    if (total >= 500) {
      totalAmount = total;
    } else {
      totalAmount = total + 20;
    }
    try {
      var options = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
      };

      var instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      let response = await instance.orders.create(options);
      res.send({ access: true, data: response });
    } catch (e) {
      console.log(e);
    }
  });
});

app.post("/placebuyorder", (req, res) => {
  let mail = req.body.mail;
  let product = req.body.product;
  let address = JSON.stringify({
    addressname: req.body.address.addressname,
    house: req.body.address.house,
    street: req.body.address.street,
    landmark: req.body.address.landmark,
    city: req.body.address.city,
    state: req.body.address.state,
    country: req.body.address.country,
  });
  let values = [
    mail,
    product.productid,
    product.title,
    product.price,
    product.discount,
    product.count,
    address,
  ];
  db.query(
    "insert into orders (mailid, productid, title, price, discount, count, address) values (?)",
    [values],
    (err, data) => {
      if (err) return res.send({ access: false, errorMsg: err });
      db.query("delete from buy where mailid = ?", mail, (err, data) => {
        if (err) return res.send({ access: false, errorMsg: err });
        res.send({ access: true });
      });
    }
  );
});

app.post("/initiatepayment", (req, res) => {
  let mail = req.body.mail;
  db.query("select * from cart where mailid = ?", mail, async (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    let total = 0;
    let orderTotal;
    data.forEach((item) => {
      let cost = item.price - (item.price * item.discount) / 100;
      total += item.count * cost;
    });
    if (total > 500) {
      orderTotal = total;
    } else {
      orderTotal = total + 20;
    }
    try {
      var options = {
        amount: Math.round(orderTotal * 100),
        currency: "INR",
      };

      var instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      let response = await instance.orders.create(options);
      res.send({ access: true, data: response });
    } catch (e) {
      console.log(e);
    }
  });
});

app.post("/placeorder", (req, res) => {
  let mail = req.body.mail;
  let address = JSON.stringify({
    addressname: req.body.address.addressname,
    house: req.body.address.house,
    street: req.body.address.street,
    landmark: req.body.address.landmark,
    city: req.body.address.city,
    state: req.body.address.state,
    country: req.body.address.country,
  });
  db.query("select * from cart where mailid = ?", mail, (err, cartData) => {
    if (err) {
      console.log(err);
      return res.send({ access: false, errorMsg: err });
    }
    cartData.forEach((product) => {
      let values = [
        mail,
        product.productid,
        product.title,
        product.price,
        product.discount,
        product.count,
        address,
      ];
      db.query(
        "insert into orders (mailid, productid, title, price, discount, count, address) values (?)",
        [values],
        (err, data) => {
          if (err) {
            console.log(err);
            return res.send({ access: false, errorMsg: err });
          }
          console.log("insert data ->", data);
        }
      );
    });
  });
  db.query("delete from cart where mailid = ?", mail, (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    res.send({ access: true });
  });
});

app.post("/getorders", (req, res) => {
  let mail = req.body.mail;
  db.query("select * from orders where mailid = ?", mail, (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    return res.send({ access: true, ordersData: data });
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

app.put("/updatebaseaddress", (req, res) => {
  let address = req.body.address;
  let mail = req.body.mailId;
  let baseAddressName = address.addressname;
  db.query(
    "update userInfo set ? where mailid = ?",
    [{ base_address: baseAddressName }, mail],
    (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg: "Some error has occurred!",
        });
      res.send({ access: true });
    }
  );
});

app.post("/getproduct", (req, res) => {
  const id = req.body.id;
  db.query("select * from products where id = ?", id, (err, data) => {
    if (err) return res.send({ access: false, errorMsg: err });
    return res.send({ access: true, data: data });
  });
});

app.post("/getproducts", (req, res) => {
  const category = req.body.category;
  let products;
  db.query(
    "select * from products where category = ?",
    category,
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      products = data;
      products.forEach((product) => {});
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

app.post("/getallreviews", (req, res) => {
  const ids = req.body.id;
  console.log(ids);
  db.query(
    "select * from reviews where productid in (?)",
    [ids],
    (err, data) => {
      if (err) return res.send({ access: false });
      console.log(data);
      res.send({ access: true, data: data });
    }
  );
});

app.post("/addreview", (req, res) => {
  let values = [
    req.body.id,
    req.body.mail,
    req.body.user,
    req.body.review,
    req.body.rating,
  ];
  db.query(
    "insert into reviews (productid, mailid, username, review, rating) values (?)",
    [values],
    (err, data) => {
      if (err) return res.send(err);
    }
  );
  db.query(
    "select * from reviews where productid = ?",
    req.body.id,
    (err, data) => {
      if (err) return res.send(err);
      res.send({ data: data, code: true });
    }
  );
});

app.put("/editreview", (req, res) => {
  let newReview = req.body.review;
  let mailId = req.body.mail;
  let productId = req.body.id;
  let rating = req.body.rating;
  db.query(
    "update reviews set ? where productid = ? and mailid = ?",
    [{ review: newReview, rating: rating }, productId, mailId],
    (err, data) => {
      if (err)
        return res.send({ code: false, errorMsg: "Some error has occurred!" });
    }
  );
  db.query(
    "select * from reviews where productid = ?",
    [productId],
    (err, data) => {
      if (err) return res.send(err);
      res.send({ data: data, code: true });
    }
  );
});

app.delete("/deletereview", (req, res) => {
  let productId = req.body.id;
  let mailId = req.body.mail;
  db.query(
    "delete from reviews where productid = ? and mailid = ?",
    [productId, mailId],
    (err, data) => {
      if (err) return res.send({ code: false });
    }
  );
  db.query(
    "select * from reviews where productid = ?",
    [productId],
    (err, data) => {
      if (err) return res.send(err);
      res.send({ data: data, code: true });
    }
  );
});

app.put("/editusername", (req, res) => {
  const first = req.body.firstname;
  const last = req.body.lastname;
  const mail = req.body.usermail;
  const fullname = first + " " + last;
  db.query(
    "update userinfo set ? where mailid = ?",
    [{ firstname: first, lastname: last }, mail],
    (err, data) => {
      if (err)
        return res.send({ access: false, error: "Some error occurred!" });
      db.query(
        "update reviews set ? where mailid = ?",
        [{ username: fullname }, mail],
        (err, data) => {
          if (err)
            return res.send({ access: false, error: "Some error occurred!" });
          res.send({ access: true });
        }
      );
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

app.put("/editusermail", async (req, res) => {
  const newmail = req.body.newmail;
  const oldmail = req.body.oldmail;
  const token = req.body.token;
  const newToken = await bcrypt.hash(newmail, 10);
  db.query(
    "update userinfo set ? where mailid = ?",
    [{ mailid: newmail, token: newToken }, oldmail],
    (err, data) => {
      if (err)
        return res.send({ access: false, error: "Some error occurred!" });
      db.query(
        "update wishlists set ? where mailid = ?",
        [{ mailid: newmail }, oldmail],
        (err, data) => {
          if (err)
            return res.send({ access: false, error: "Some error occurred!" });
          db.query(
            "update wishlistitems set ? where mailid = ?",
            [{ mailid: newmail }, oldmail],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  error: "Some error occurred!",
                });
              db.query(
                "update cart set ? where mailid = ?",
                [{ mailid: newmail }, oldmail],
                (err, data) => {
                  if (err)
                    return res.send({
                      access: false,
                      error: "Some error occurred!",
                    });
                  db.query(
                    "update orders set ? where mailid = ?",
                    [{ mailid: newmail }, oldmail],
                    (err, data) => {
                      if (err)
                        return res.send({
                          access: false,
                          error: "Some error occurred!",
                        });
                      db.query(
                        "update reviews set ? where mailid = ?",
                        [{ mailid: newmail }, oldmail],
                        (err, data) => {
                          if (err)
                            res.send({
                              access: false,
                              error: "Some error occurred!",
                            });
                          db.query(
                            "update address set ? where usermail = ?",
                            [{ usermail: newmail }, oldmail],
                            (err, data) => {
                              if (err)
                                res.send({
                                  access: false,
                                  error: "Some error occurred!",
                                });
                              res.send({ access: true, token: newToken });
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
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

app.post("/getcompany", (req, res) => {
  const category = req.body.category;
  db.query(
    "select distinct company from products where category = ?",
    category,
    (err, data) => {
      if (err) return res.send(err);
      res.send(data);
    }
  );
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
