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
import Razorpay from "razorpay";
import { v4 } from "uuid";

const app = express();
app.use(express.json());
app.use(express.text());
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

function setcompany() {
  db.query("select DISTINCT productid from wishlistitems", (err, orderdata) => {
    if (err) return console.log(err);
    orderdata.forEach((order) => {
      db.query(
        "select company from products where id = ?",
        order.productid,
        (err, companydata) => {
          if (err) return console.log(err);
          const company = companydata[0].company;
          db.query(
            "update wishlistitems set ? where productid = ?",
            [{ company: company }, order.productid],
            (err, data) => {
              if (err) return console.log(err);
            }
          );
        }
      );
    });
  });
  console.log("done");
}

function setcategory() {
  db.query("select DISTINCT productid from wishlistitems", (err, orderdata) => {
    if (err) return console.log(err);
    orderdata.forEach((order) => {
      db.query(
        "select category from products where id = ?",
        order.productid,
        (err, categorydata) => {
          if (err) return console.log(err);
          const category = categorydata[0].category;
          db.query(
            "update wishlistitems set ? where productid = ?",
            [{ category: category }, order.productid],
            (err, data) => {
              if (err) return console.log(err);
            }
          );
        }
      );
    });
  });
  console.log("done");
}

function setFinalPrice() {
  db.query("select * from orders", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    data.forEach((row) => {
      const final_price =
        Math.round((row.price - (row.price * row.discount) / 100) * 100) / 100;
      const id = row.id;
      db.query(
        "update orders set ? where id = ?",
        [{ final_price: final_price }, id],
        (err, data) => {
          if (err) return err;
          console.log("done");
        }
      );
    });
  });
}

function setTotalSales() {
  db.query("select productid, count from orders", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    data.forEach((order) => {
      db.query(
        "select (total_sales) from products where id = ?",
        [order.productid],
        (err, data) => {
          if (err) {
            console.log(err);
            return;
          }
          if (data.length) {
            console.log(data);
            console.log(data[0].total_sales, order.count);
            const sales = data[0].total_sales + order.count;
            db.query(
              "update products set ? where id = ?",
              [{ total_sales: sales }, order.productid],
              (err, data) => {
                if (err) {
                  console.log(err);
                  return;
                }
              }
            );
          }
        }
      );
    });
  });
}

// setTotalSales();

// setFinalPrice();

// setcompany();

// setcategory();

app.get("/", (req, res) => {
  res.json("Hello...");
});

/* Registration and Authentication */
// In Register page
app.post("/addUser", async (req, res) => {
  let firstname = req.body.first;
  let lastname = req.body.last;
  let mail = req.body.mail;
  let password = req.body.password;
  let exists = false;
  try {
    db.query(
      "select * from userinfo where mailid = ?",
      [mail],
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred. Please re-try or refresh the page!",
          });
        if (data.length) {
          exists = true;
        }
        if (exists) {
          return res.send({
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
                  errorMsg:
                    "Some error has occurred. Please re-try or refresh the page!",
                });
              res.send({ access: true, token: token });
            }
          );
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
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
  try {
    db.query(
      "select * from userinfo where mailid = ?",
      [mailId],
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred. Please re-try or refresh the page!",
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
                    errorMsg:
                      "Some error has occurred. Please re-try or refresh the page!",
                  });
                console.log(data);
                db.query(
                  "select * from address where addressname = ?",
                  [baseAddress],
                  (err, add) => {
                    if (err)
                      return res.send({
                        access: false,
                        errorMsg:
                          "Some error has occurred. Please re-try or refresh the page!",
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
          res.send({ access: false, errorMsg: "User does not exist!" });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

// In Account page
app.post("/authenticateuser", async (req, res) => {
  const mailId = req.body.mail;
  const token = req.body.token;
  try {
    db.query("select * from userinfo where mailid = ?", mailId, (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred. Please re-try or refresh the page!",
        });
      const actualToken = data[0].token;
      if (actualToken === token) return res.send({ access: true, data: data });
      else
        res.send({
          access: false,
          errorMsg:
            "Your security token has been compromized! Please sign in again.",
        });
    });
  } catch (err) {
    console.log(err);
  }
});

// In Checkout page
app.post("/checkauthorized", async (req, res) => {
  const mail = req.body.mail;
  const token = req.body.token;
  try {
    db.query(
      "select token from userinfo where mailid = ?",
      mail,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred. Please re-try or refresh the page!",
            logout: false,
          });
        if (data[0].token === token) return res.send({ access: true });
        else
          res.send({
            access: false,
            errorMsg:
              "You are not authorized! Your user credentials do not match. Please Login again!",
            logout: true,
          });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/* Merchant Account Server Routes */

app.post("/addmerchant", async (req, res) => {
  const mail = req.body.mail;
  const company = req.body.company;
  const password = req.body.password;
  const passwordHash = await bcrypt.hash(password, 10);
  const token = await bcrypt.hash(mail, 10);
  const values = [company, mail, passwordHash, token];
  try {
    db.query(
      "select company from merchant where company = ?",
      company,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred. Please re-try or refresh the page!",
          });
        if (data.length)
          return res.send({
            access: false,
            errorMsg: "This company is already linked to an existing account!",
          });
        db.query(
          "insert into merchant (company, mailid, password, token) values (?)",
          [values],
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred. Please re-try or refresh the page!",
              });
            db.query(
              "insert into company (company) values (?)",
              [company],
              (err, data) => {
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred. Please re-try or refresh the page!",
                  });
                res.send({ access: true, token: token });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/authenticatemerchant", async (req, res) => {
  const mail = req.body.mail;
  const password = req.body.password;
  try {
    db.query(
      "select * from merchant where mailid = ?",
      mail,
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        if (data.length) {
          const actualPassword = data[0].password;
          const passwordCheck = await bcrypt.compare(password, actualPassword);
          if (passwordCheck) {
            const company = data[0].company;
            const token = await bcrypt.hash(mail, 10);
            db.query(
              "update merchant set ? where mailid = ?",
              [{ token: token }, mail],
              (err, data) => {
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred! Please try again or refresh the page!",
                  });
                return res.send({ access: true, company, token });
              }
            );
          } else
            return res.send({
              access: false,
              errorMsg: "Password incorrect! Please try again.",
            });
        } else
          return res.send({
            access: false,
            errorMsg: "Merchant email does not exist!",
          });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/checkmerchant", (req, res) => {
  const mail = req.body.mail;
  const token = req.body.token;
  const company = req.body.company;
  db.query("select token from merchant where mailid = ?", mail, (err, data) => {
    if (err)
      return res.send({
        access: false,
        errorMsg:
          "Some error has occurred! Please try again or refresh the page!",
      });
    if (data.length) {
      if (data[0].token == token) {
        let ordersData;
        let inventoryData;
        db.query(
          "select orders.*, products.* from orders inner join products on orders.productid = products.id where company = ?",
          company,
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred! Please try again or refresh the page!",
              });
            ordersData = data;
            db.query(
              "select * from products where company = ?",
              company,
              (err, data) => {
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred! Please try again or refresh the page!",
                  });
                inventoryData = data;
                return res.send({ access: true, ordersData, inventoryData });
              }
            );
          }
        );
      } else {
        return res.send({
          access: false,
          errorMsg:
            "Your credentials have been compromised please login again!",
          logout: true,
        });
      }
    } else {
      return res.send({
        access: false,
        errorMsg: "Your credentials have been compromised please login again!",
        logout: true,
      });
    }
  });
});

app.post("/getmerchantorders", (req, res) => {
  const company = req.body.company;
  const orderStatus = req.body.orderStatus;
  try {
    db.query(
      "select orders.*, products.* from orders inner join products on orders.productid = products.id where company = ? and order_status = ?",
      [company, orderStatus],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({ access: true, data });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/markasshipped", (req, res) => {
  const orderId = req.body.orderId;
  try {
    db.query(
      "update orders set ? where id = ?",
      [{ order_status: "Order shipped" }, orderId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        return res.send({
          access: true,
          successMsg: "Order status has been successfully updated to Shipped!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/getinventory", (req, res) => {
  const company = req.body.company;
  try {
    db.query(
      "select * from products where company = ?",
      company,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        return res.send({ access: true, data });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/updateinventory", (req, res) => {
  const productId = req.body.id;
  const stockValue = req.body.stockValue;
  try {
    db.query(
      "update products set ? where id = ?",
      [{ stock_left: stockValue }, productId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        return res.send({
          access: true,
          successMsg: "Product inventory has been updated successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.put("/editcompanyname", (req, res) => {
  const newCompany = req.body.newCompany;
  const merchantmail = req.body.merchantmail;
  const oldCompany = req.body.oldCompany;
  try {
    db.query(
      "update merchant set ? where mailid = ?",
      [{ company: newCompany }, merchantmail],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        db.query(
          "update products set ? where company = ?",
          [{ company: newCompany }, oldCompany],
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred! Please try again or refresh the page!",
              });
            db.query(
              "Update company set ? where company = ?",
              [{ company: newCompany }, oldCompany],
              (err, data) => {
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred! Please try again or refresh the page!",
                  });
                return res.send({
                  access: true,
                  successMsg: "Company name has been updated successfully!",
                });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/getmerchantemailotp", (req, res) => {
  const mailId = req.body.mail;
  const type = req.body.type;
  try {
    db.query(
      "select mailid from merchant where mailid = ?",
      [mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        if (data.length) {
          return res.send({
            access: false,
            errorMsg: "Email is already linked with another account!",
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

          let subject, htmlMsg;
          switch (type) {
            case "register":
              subject = "DREAMKART merchant account registration OTP request!";
              htmlMsg =
                "Your OTP to register your DREAMKART merchant account is:";
              break;

            case "edit":
              subject = "DREAMKART merchant account email change OTP request!";
              htmlMsg =
                "Your OTP to change the email address for your DREAMKART merchant account is:";
              break;

            default:
              break;
          }

          async function sendmail() {
            const OTP = await crypto.randomInt(100000, 999999);
            transporter.sendMail({
              to: mailId,
              subject: subject,
              html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;">
              <h2 style="color: #333;">Email Verification</h2>
              <p style="font-size: 16px; color: #555;">${htmlMsg}</p>
              <h1 style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${OTP}</h1>
            </div>`,
            });
            let hashedOTP = await bcrypt.hash(OTP.toString(), 10);
            res.send({ access: true, otp: hashedOTP });
          }
          sendmail();
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.put("/editmerchantemail", async (req, res) => {
  const newMail = req.body.newMail;
  const oldMail = req.body.oldMail;
  const token = req.body.token;
  const newToken = await bcrypt.hash(newMail, 10);
  try {
    db.query(
      "select * from merchant where mailid = ?",
      oldMail,
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        const actualToken = data[0].token;
        if (actualToken === token) {
          db.query(
            "update merchant set ? where mailid = ?",
            [{ mailid: newMail, token: newToken }, oldMail],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
              return res.send({
                access: true,
                token: newToken,
                successMsg: "Your company email has been updated successfully!",
              });
            }
          );
        } else {
          return res.send({
            access: false,
            errorMsg:
              "Your credentials have been compromised please login again!",
            logout: true,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.put("/editmerchantpassword", (req, res) => {
  const mail = req.body.mail;
  const token = req.body.token;
  const oldPassword = req.body.old;
  const newPassword = req.body.new;
  try {
    db.query(
      "select password from merchant where mailid = ?",
      [mail],
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        let checkOld = await bcrypt.compare(oldPassword, data[0].password);
        if (checkOld) {
          let checkNew = await bcrypt.compare(newPassword, data[0].password);
          if (checkNew) {
            return res.send({
              access: false,
              errorMsg: "New and Old passwords cannot be the same!",
            });
          } else {
            let newPasswordToken = await bcrypt.hash(newPassword, 10);
            db.query(
              "update merchant set ? where token = ?",
              [{ password: newPasswordToken }, token],
              (err, data) => {
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred! Please try again or refresh the page!",
                  });
                return res.send({
                  access: true,
                  successMsg: "Password changed successfully!",
                });
              }
            );
          }
        } else {
          return res.send({
            access: false,
            errorMsg: "Oldpassword is incorrect! Please try again.",
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/* Categories and Companies Server Routes */

app.get("/getallcategories", async (req, res) => {
  try {
    db.query("select * from category", (err, data) => {
      if (err) {
        return res.send({
          access: false,
          err,
          errorMsg:
            "Some error has occurred. Please re-try or refresh the page!",
        });
      }
      return res.send({ access: true, data });
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/getcatandcom", async (req, res) => {
  let categoryData;
  let companyData;
  try {
    db.query("select distinct category from Category", (err, catData) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred. Please re-try or refresh the page!",
        });
      categoryData = catData;
      db.query("select distinct company from company", (err, compData) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred. Please re-try or refresh the page!",
          });
        companyData = compData;
        res.send({ access: true, categoryData, companyData });
      });
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/getcompany", (req, res) => {
  const category = req.body.category;
  try {
    db.query(
      "select distinct company from products where category = ?",
      category,
      (err, companyData) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({ access: true, data: companyData });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/addcategory", async (req, res) => {
  const category = req.body.category;
  try {
    db.query(
      "insert into category (category) values (?)",
      [category],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
      }
    );
    db.query("select * from category", (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred! Please try again or refresh the page!",
        });
      res.send({
        access: true,
        data,
        successMsg: "New category has been added successfully!",
      });
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/addcompany", async (req, res) => {
  const company = req.body.company;
  try {
    db.query(
      "insert into company (company) values (?)",
      [company],
      (err, data) => {
        if (err) return res.send(err);
        res.send("done");
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/* Products Server Routes */

app.post("/getproducts", (req, res) => {
  const category = req.body.category;
  try {
    db.query(
      "select * from products where category = ?",
      category,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({ access: true, data });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/getmerchantproducts", (req, res) => {
  const company = req.body.company;
  try {
    db.query(
      "select * from products where company = ?",
      company,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({ access: true, data });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/getproduct", (req, res) => {
  const id = req.body.id;
  try {
    db.query("select * from products where id = ?", id, (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred! Please try again or refresh the page!",
        });
      res.send({ access: true, data });
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/gethomeproducts", (req, res) => {
  let mostDiscount;
  let mostBought;
  try {
    db.query(
      "select * from products order by discount desc limit 5",
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        mostDiscount = data;
        db.query(
          "select * from products order by total_sales desc limit 5",
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred! Please try again or refresh the page!",
              });
            mostBought = data;
            res.send({ access: true, mostDiscount, mostBought });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/addproduct", async (req, res) => {
  const imageTags = JSON.stringify(req.body.imageTags);
  const totalSales = 0;
  const values = [
    req.body.title,
    req.body.description,
    Number(req.body.price),
    Number(req.body.discount),
    Number(req.body.final),
    req.body.category,
    req.body.company,
    Number(req.body.limit),
    Number(req.body.quantity),
    Number(req.body.alert),
    totalSales,
    imageTags,
  ];
  try {
    db.query(
      "insert into products (title, description, price, discount, final_price, category, company, buy_limit, stock_left, stock_alert, total_sales, imageTags) values (?)",
      [values],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          successMsg: "Your product has been added successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.put("/updateproduct", async (req, res) => {
  const imageTags = JSON.stringify(req.body.imageTags);
  try {
    db.query(
      "update products set ? where id = ?",
      [
        {
          title: req.body.title,
          description: req.body.description,
          price: Number(req.body.price),
          discount: Number(req.body.discount),
          final_price: Number(req.body.final),
          category: req.body.category,
          company: req.body.company,
          buy_limit: Number(req.body.limit),
          stock_left: Number(req.body.quantity),
          stock_alert: Number(req.body.alert),
          imageTags: imageTags,
        },
        req.body.id,
      ],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          successMsg: "Product details have been updated successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/generateputurls", async (req, res) => {
  const { imagesData } = req.body;
  try {
    for (let i = 0; i < imagesData.length; i++) {
      const imageId = v4();
      const key = `E-Commerce/${imagesData[i].imageName}-${imageId}.${
        imagesData[i].imageType.split("/")[1]
      }`;
      const params = {
        Bucket: bucketName,
        Key: key,
        ContentType: imagesData[i].imageType,
      };
      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3, command);
      imagesData[i].key = key;
      imagesData[i].url = url;
    }
    res.send(imagesData);
  } catch (err) {
    console.log(err);
  }
});

app.post("/generategeturls", async (req, res) => {
  const { imageKeys } = req.body;
  const imageUrls = [];
  try {
    for (let i = 0; i < imageKeys.length; i++) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: imageKeys[i],
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 86400 });
      imageUrls.push({ imageTag: imageKeys[i], imageUrl: url });
    }
    res.send(imageUrls);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/deleteimages", async (req, res) => {
  const { imageTags } = req.body;
  try {
    for (let i = 0; i < imageTags.length; i++) {
      const params = {
        Bucket: bucketName,
        Key: imageTags[i],
      };
      const command = new DeleteObjectCommand(params);
      const deleteOldPictureResponse = await s3.send(command);
    }
    res.send("Images deleted!");
  } catch (err) {
    console.log(err);
  }
});

app.post("/deleteimages", async (req, res) => {
  const data = JSON.parse(req.body);
  const { imageTags } = data;
  try {
    for (let i = 0; i < imageTags.length; i++) {
      const params = {
        Bucket: bucketName,
        Key: imageTags[i],
      };
      const command = new DeleteObjectCommand(params);
      const deleteOldPictureResponse = await s3.send(command);
    }
    res.send("Images deleted!");
  } catch (err) {
    console.log(err);
  }
});

/* Reviews and Ratings Routes */

app.post("/getreviews", (req, res) => {
  const id = req.body.id;
  try {
    db.query("select * from reviews where productid = ?", id, (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred! Please try again or refresh the page!",
        });
      res.send({ access: true, data });
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/getallreviews", (req, res) => {
  const ids = req.body.id;
  if (ids.length) {
    try {
      db.query(
        "select * from reviews where productid in (?)",
        [ids],
        (err, reviewsData) => {
          if (err) {
            console.log(err);
            return res.send({
              access: false,
              errorMsg:
                "Some error has occurred! Please try again or refresh the page!",
            });
          }
          res.send({ access: true, data: reviewsData });
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
});

app.post("/addreview", (req, res) => {
  let values = [
    req.body.id,
    req.body.mail,
    req.body.user,
    req.body.review,
    req.body.rating,
  ];
  try {
    db.query(
      "insert into reviews (productid, mailid, username, review, rating) values (?)",
      [values],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
      }
    );
    db.query(
      "select * from reviews where productid = ?",
      req.body.id,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          data: data,
          successMsg: "Your review has been updated successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.put("/editreview", (req, res) => {
  let newReview = req.body.review;
  let mailId = req.body.mail;
  let productId = req.body.id;
  let rating = req.body.rating;
  try {
    db.query(
      "update reviews set ? where productid = ? and mailid = ?",
      [{ review: newReview, rating: rating }, productId, mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
      }
    );
    db.query(
      "select * from reviews where productid = ?",
      [productId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          data,
          successMsg: "Your review has been updated successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.delete("/deletereview", (req, res) => {
  let productId = req.body.id;
  let mailId = req.body.mail;
  try {
    db.query(
      "delete from reviews where productid = ? and mailid = ?",
      [productId, mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
      }
    );
    db.query(
      "select * from reviews where productid = ?",
      [productId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          data: data,
          successMsg: "Your review has been deleted successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/* Wishlists and Wishlist Items Server Routes */

app.post("/getwishlists", (req, res) => {
  let mailId = req.body.mailId;
  try {
    db.query(
      "select * from wishlists where mailid = ?",
      [mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({ access: true, data });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/addwishlist", (req, res) => {
  let mailId = req.body.mailId;
  let listName = req.body.wishlistname;
  try {
    db.query(
      "insert into wishlists (mailid, wishlistname) values(?)",
      [[mailId, listName]],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
      }
    );
    db.query(
      "select * from wishlists where mailid = ?",
      [mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          data: data,
          successMsg: `Successfully created new wishlist - ${listName}`,
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.delete("/deletewishlist", (req, res) => {
  let list = req.body.list;
  let mail = req.body.mail;
  try {
    db.query(
      "delete from wishlists where wishlistname = ? and mailid = ?",
      [list, mail],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        db.query(
          "delete from wishlistitems where wishlistname = ? and mailid = ?",
          [list, mail],
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred! Please try again or refresh the page!",
              });
            res.send({
              access: true,
              successMsg: `${list} has been deleted successfully!`,
            });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/getfromwish", (req, res) => {
  const mailId = req.body.mailId;
  try {
    db.query(
      "select wishlistitems.*, products.* from wishlistitems inner join products on wishlistitems.productid = products.id where mailid = ?",
      mailId,
      (err, data) => {
        if (err) {
          console.log(err);
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        }
        res.send({ access: true, data: data });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/checkwished", (req, res) => {
  let mail = req.body.mailId;
  let productId = req.body.productId;
  try {
    db.query(
      "select wishlistname from wishlistitems where mailid = ? and productid = ?",
      [mail, productId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        if (data.length) {
          res.send({ access: true, data: data });
        } else {
          res.send({ access: false });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/addtowish", (req, res) => {
  const values = [req.body.id, req.body.mailId, req.body.wishlist];
  try {
    db.query(
      "select * from wishlistitems where mailid = ? and wishlistname = ? and productid = ?",
      [req.body.mailId, req.body.wishlist, req.body.id],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        if (data.length) {
          return res.send({
            access: false,
            errorMsg: `You already have this product in ${req.body.wishlist}!`,
          });
        } else {
          db.query(
            "insert into wishlistitems (productid, mailid, wishlistname) values (?)",
            [values],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
              res.send({
                access: true,
                successMsg: `Product has been successfully added to ${req.body.wishlist}`,
              });
            }
          );
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.delete("/removefromwish", (req, res) => {
  const id = req.body.productId;
  const listname = req.body.list;
  const mailId = req.body.mail;
  try {
    db.query(
      "delete from wishlistitems where mailid = ? and wishlistname = ? and productid = ?",
      [mailId, listname, id],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          successMsg: `Product has been successfully deleted from ${listname}!`,
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/* Cart Server Routes */

app.post("/getcartitems", (req, res) => {
  const mailId = req.body.mailId;
  try {
    db.query(
      "select cart.*, products.* from cart inner join products on products.id = cart.productid where mailid = ?",
      mailId,
      (err, cartData) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({ access: true, data: cartData });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/addtocart", (req, res) => {
  const id = req.body.id;
  const mailId = req.body.mailId;
  const itemCount = req.body.count;
  try {
    db.query(
      "select count from cart where productid = ? and mailid = ?",
      [id, mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
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
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred! Please try again or refresh the page!",
                  });
                res.send({
                  access: true,
                  successMsg: "Successfully updated product quantity in cart!",
                });
              }
            );
          }
        } else {
          const values = [mailId, id, itemCount];
          db.query(
            "insert into cart (mailid, productid, count) values (?)",
            [values],
            (err, data) => {
              if (err) {
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
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
  } catch (err) {
    console.log(err);
  }
});

app.put("/updatecartitemcount", (req, res) => {
  let cartData = req.body.cartData;
  let mail = req.body.mail;
  try {
    db.query("select * from cart where mailid = ?", mail, (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred! Please try again or refresh the page!",
        });
      let previousCart = data;
      for (let i = 0; i < previousCart.length; i++) {
        if (previousCart[i].count != cartData[i].count) {
          db.query(
            "update cart set ? where productid = ? and mailid = ?",
            [{ count: cartData[i].count }, cartData[i].productid, mail],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
            }
          );
        }
      }
      res.send({ access: true });
    });
  } catch (err) {
    console.log(err);
  }
});

app.delete("/removecartitem", (req, res) => {
  const { id, mailId } = req.body;
  try {
    db.query(
      "delete from cart where productid = ? and mailid = ?",
      [id, mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          successMsg: "Product has been removed from cart successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/* User Credentials Server Routes */

app.put("/editusername", (req, res) => {
  const first = req.body.firstname;
  const last = req.body.lastname;
  const mail = req.body.usermail;
  const fullname = first + " " + last;
  try {
    db.query(
      "update userinfo set ? where mailid = ?",
      [{ firstname: first, lastname: last }, mail],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        db.query(
          "update reviews set ? where mailid = ?",
          [{ username: fullname }, mail],
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred! Please try again or refresh the page!",
              });
            res.send({
              access: true,
              successMsg: "Username updated successfully!",
            });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/getemailchangeotp", (req, res) => {
  const mailId = req.body.mail;
  const type = req.body.type;
  try {
    db.query(
      "select mailid from userinfo where mailid = ?",
      [mailId],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        if (data.length) {
          res.send({
            access: false,
            errorMsg: "Email is already linked with another account!",
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

          let subject, htmlMsg;
          switch (type) {
            case "register":
              subject = "DREAMKART account register OTP request!";
              htmlMsg = "Your OTP to register your DREAMKART account is:";
              break;

            case "edit":
              subject = "DREAMKART account email change OTP request!";
              htmlMsg =
                "Your OTP to change your DREAMKART account's email address is:";
              break;
          }

          async function sendmail() {
            const OTP = await crypto.randomInt(100000, 999999);
            transporter.sendMail({
              to: mailId,
              subject: subject,
              html: `
              <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p style="font-size: 16px; color: #555;">${htmlMsg}</p>
                <h1 style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${OTP}</h1>
              </div>`,
            });
            let hashedOTP = await bcrypt.hash(OTP.toString(), 10);
            res.send({ access: true, otp: hashedOTP });
          }
          sendmail();
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/checkotp", async (req, res) => {
  const enteredOTP = req.body.enteredOTP;
  const sentOTP = req.body.sentOTP;
  try {
    const compareOTP = await bcrypt.compare(enteredOTP, sentOTP);
    if (compareOTP) res.send({ access: true });
    else res.send({ access: false });
  } catch (err) {
    console.log(err);
  }
});

app.put("/editusermail", async (req, res) => {
  const newmail = req.body.newmail;
  const oldmail = req.body.oldmail;
  const token = req.body.token;
  try {
    const newToken = await bcrypt.hash(newmail, 10);
    db.query(
      "update userinfo set ? where mailid = ?",
      [{ mailid: newmail, token: newToken }, oldmail],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        db.query(
          "update wishlists set ? where mailid = ?",
          [{ mailid: newmail }, oldmail],
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred! Please try again or refresh the page!",
              });
            db.query(
              "update wishlistitems set ? where mailid = ?",
              [{ mailid: newmail }, oldmail],
              (err, data) => {
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred! Please try again or refresh the page!",
                  });
                db.query(
                  "update cart set ? where mailid = ?",
                  [{ mailid: newmail }, oldmail],
                  (err, data) => {
                    if (err)
                      return res.send({
                        access: false,
                        errorMsg:
                          "Some error has occurred! Please try again or refresh the page!",
                      });
                    db.query(
                      "update orders set ? where mailid = ?",
                      [{ mailid: newmail }, oldmail],
                      (err, data) => {
                        if (err)
                          return res.send({
                            access: false,
                            errorMsg:
                              "Some error has occurred! Please try again or refresh the page!",
                          });
                        db.query(
                          "update reviews set ? where mailid = ?",
                          [{ mailid: newmail }, oldmail],
                          (err, data) => {
                            if (err)
                              res.send({
                                access: false,
                                errorMsg:
                                  "Some error has occurred! Please try again or refresh the page!",
                              });
                            db.query(
                              "update address set ? where usermail = ?",
                              [{ usermail: newmail }, oldmail],
                              (err, data) => {
                                if (err)
                                  res.send({
                                    access: false,
                                    errorMsg:
                                      "Some error has occurred! Please try again or refresh the page!",
                                  });
                                res.send({
                                  access: true,
                                  token: newToken,
                                  successMsg: "Email updates successfully!",
                                });
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
  } catch (err) {
    console.log(err);
  }
});

app.put("/edituserpassword", (req, res) => {
  const mail = req.body.mail;
  const token = req.body.token;
  const oldPassword = req.body.old;
  const newPassword = req.body.new;
  try {
    db.query(
      "select password from userinfo where mailid = ?",
      [mail],
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        let checkOld = await bcrypt.compare(oldPassword, data[0].password);
        if (checkOld) {
          let checkNew = await bcrypt.compare(newPassword, data[0].password);
          if (checkNew) {
            return res.send({
              access: false,
              errorMsg: "New and Old passwords cannot be the same!",
            });
          } else {
            let newPasswordToken = await bcrypt.hash(newPassword, 10);
            db.query(
              "update userinfo set ? where token = ?",
              [{ password: newPasswordToken }, token],
              (err, data) => {
                if (err)
                  return res.send({
                    access: false,
                    errorMsg:
                      "Some error has occurred! Please try again or refresh the page!",
                  });
                res.send({
                  access: true,
                  successMsg: "Password changed successfully!",
                });
              }
            );
          }
        } else {
          res.send({
            access: false,
            errorMsg: "Oldpassword is incorrect! Please try again.",
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/* Address Server Routes */

app.post("/getaddress", (req, res) => {
  try {
    db.query(
      "select * from address where usermail = ?",
      req.body.mail,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({ access: true, data });
      }
    );
  } catch (err) {
    console.log(err);
  }
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
  try {
    db.query(
      "select * from address where usermail = ? and addressname = ?",
      [req.body.mail, req.body.name],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        if (data.length) {
          res.send({
            access: false,
            errorMsg:
              "You have another address with the same address name! Address names have to be unique!",
          });
        } else {
          db.query(
            "insert into address (usermail, addressname, house, street, landmark, city, state, country) values (?)",
            [values],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
            }
          );
          db.query(
            "select * from address where usermail = ?",
            req.body.mail,
            (err, addressData) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
              res.send({
                access: true,
                data: addressData,
                successMsg: "Address has been added successfully!",
              });
            }
          );
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.put("/updatebaseaddress", (req, res) => {
  let address = req.body.address;
  let mail = req.body.mailId;
  let baseAddressName = address.addressname;
  try {
    db.query(
      "update userinfo set ? where mailid = ?",
      [{ base_address: baseAddressName }, mail],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        res.send({
          access: true,
          successMsg: "Delivery address has been updated successfully!",
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.delete("/deleteaddress", (req, res) => {
  let mail = req.body.mail;
  let addressname = req.body.addressname;
  let addressId = req.body.addressId;
  try {
    db.query(
      "delete from address where id = ? and addressname = ? and usermail = ?",
      [addressId, addressname, mail],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
      }
    );
    db.query(
      "update userinfo set ? where base_address = ? and mailid = ?",
      [{ base_address: null }, addressname, mail],
      (err, res) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
      }
    );
    db.query("select * from address where usermail = ?", mail, (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred! Please try again or refresh the page!",
        });
      res.send({
        access: true,
        data: data,
        successMsg: "Address has been deleted successfully!",
      });
    });
  } catch (err) {
    console.log(err);
  }
});

/* Buy, Checkout, Orders and Payment Server Routes */

app.post("/buyproduct", (req, res) => {
  let productData = req.body.product;
  let mail = req.body.mail;
  let count = req.body.count;
  let deliveryDate = req.body.deliveryDate;
  let values = [mail, productData.id, count, deliveryDate];
  try {
    db.query("select id from buy where mailid = ?", mail, (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred! Please try again or refresh the page!",
        });
      if (data.length) {
        db.query("delete from buy where mailid = ?", mail, (err, data) => {
          if (err)
            return res.send({
              access: false,
              errorMsg:
                "Some error has occurred! Please try again or refresh the page!",
            });
          db.query(
            "insert into buy (mailid, productid, count, delivery_date) values (?)",
            [values],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
              res.send({ access: true });
            }
          );
        });
      } else {
        db.query(
          "insert into buy (mailid, productid, count, delivery_date) values (?)",
          [values],
          (err, data) => {
            if (err)
              return res.send({
                access: false,
                errorMsg:
                  "Some error has occurred! Please try again or refresh the page!",
              });
            res.send({ access: true });
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/getbuyproduct", (req, res) => {
  const mail = req.body.mail;
  try {
    db.query(
      "select buy.*, products.* from buy inner join products on products.id = buy.productid where buy.mailid = ?",
      mail,
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        return res.send({ access: true, data: data });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/initiatebuypayment", (req, res) => {
  let mail = req.body.mail;
  try {
    db.query(
      "select buy.*, products.* from buy inner join products on products.id = buy.productid where buy.mailid = ?",
      mail,
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
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
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/placebuyorder", (req, res) => {
  let mail = req.body.mail;
  let product = req.body.product;
  let address = req.body.address;
  let deliveryDate = req.body.deliveryDate;
  let addressData = JSON.stringify({
    addressname: address.addressname,
    house: address.house,
    street: address.street,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    country: address.country,
  });
  const orderStatus = "Order placed";
  let values = [
    mail,
    product.productid,
    product.count,
    addressData,
    deliveryDate,
    orderStatus,
  ];
  try {
    db.query(
      "insert into orders (mailid, productid, count, address, delivery_date, order_status) values (?)",
      [values],
      (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        db.query("delete from buy where mailid = ?", mail, (err, data) => {
          if (err)
            return res.send({
              access: false,
              errorMsg:
                "Some error has occurred! Please try again or refresh the page!",
            });
          db.query(
            "select (total_sales) from products where id = ?",
            [product.productid],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
              let sales = data[0].total_sales + product.count;
              db.query(
                "update products set ? where id = ?",
                [{ total_sales: sales }, product.productid],
                (err, data) => {
                  if (err)
                    return res.send({
                      access: false,
                      errorMsg:
                        "Some error has occurred! Please try again or refresh the page!",
                    });
                  res.send({ access: true });
                }
              );
            }
          );
        });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/initiatepayment", (req, res) => {
  let mail = req.body.mail;
  try {
    db.query(
      "select cart.*, products.* from cart inner join products on products.id = cart.productid where mailid = ?",
      mail,
      async (err, data) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
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
      }
    );
  } catch (err) {
    console.log(err);
  }
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
  const order_status = "Order placed";
  try {
    db.query(
      "select cart.*, products.* from cart inner join products on cart.productid = products.id where mailid = ?",
      mail,
      (err, cartData) => {
        if (err) {
          console.log(err);
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        }
        cartData.forEach((product) => {
          let values = [
            mail,
            product.productid,
            product.count,
            address,
            order_status,
          ];
          db.query(
            "insert into orders (mailid, productid, count, address, order_status) values (?)",
            [values],
            (err, data) => {
              if (err)
                return res.send({
                  access: false,
                  errorMsg:
                    "Some error has occurred! Please try again or refresh the page!",
                });
              db.query(
                "select (total_sales) from products where id = ?",
                [product.productid],
                (err, data) => {
                  if (err)
                    return res.send({
                      access: false,
                      errorMsg:
                        "Some error has occurred! Please try again or refresh the page!",
                    });
                  let sales = data[0].total_sales + product.count;
                  db.query(
                    "update products set ? where id = ?",
                    [{ total_sales: sales }, product.productid],
                    (err, data) => {
                      if (err)
                        return res.send({
                          access: false,
                          errorMsg:
                            "Some error has occurred! Please try again or refresh the page!",
                        });
                    }
                  );
                }
              );
            }
          );
        });
      }
    );
    db.query("delete from cart where mailid = ?", mail, (err, data) => {
      if (err)
        return res.send({
          access: false,
          errorMsg:
            "Some error has occurred! Please try again or refresh the page!",
        });
      res.send({ access: true });
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/getorders", (req, res) => {
  let mail = req.body.mail;
  try {
    db.query(
      "select orders.*, products.* from orders inner join products on orders.productid = products.id where mailid = ?",
      mail,
      (err, ordersData) => {
        if (err)
          return res.send({
            access: false,
            errorMsg:
              "Some error has occurred! Please try again or refresh the page!",
          });
        return res.send({ access: true, data: ordersData });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
