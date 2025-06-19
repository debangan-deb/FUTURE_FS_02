import express from "express";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "./mail.js";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
const otps = new Map();
import dotenv from 'dotenv';
dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const r = express.Router();
r.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
  if (rows.length) return res.status(400).send("Exists");
  const hash = bcrypt.hashSync(password, 8);
  await pool.query("INSERT INTO users SET ?", { name, email, password: hash });
  res.send("OK");
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

  if (!rows.length) {
    return res.status(400).json({ error: "Email not found" });
  }

  const match = bcrypt.compareSync(password, rows[0].password);
  if (!match) {
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);
  res.json({ token });
});

r.post("/admin", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM admin WHERE email=?", [email]);
  if (!rows.length || !bcrypt.compareSync(password, rows[0].password)) return res.status(401).send("Invalid");
  res.send("AdminOK");
});

r.get("/admin-dashboard", async (req, res) => {
  const [products] = await pool.query("SELECT * FROM products ORDER BY id DESC");
  res.json({ products });
});
r.patch("/admin/product/:id", async (req, res) => {
  const { id } = req.params;
  const { title, category, price, image } = req.body;

  await pool.query(
    "UPDATE products SET title = ?,  category = ?, price = ?, image = ? WHERE id = ?",
    [title, category, price, image, id]
  );
  res.send("Product Updated");
});


r.post("/order", async (req, res) => {
  const { token, name, address, phone, items, total, payment_id } = req.body;

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    await pool.query("INSERT INTO orders SET ?", {
      user_id: id,
      name,
      address,
      phone,
      total,
      items: JSON.stringify(items),
      status: "Pending",
      payment_id: payment_id || null
    });

    try {
      const [[user]] = await pool.query("SELECT email FROM users WHERE id=?", [id]);
      await sendMail(user.email, "Order Confirmation - ShopNext", `
        <h2>Thank you for your order!</h2>
        <p><strong>Total:</strong> ₹${total}</p>
        <p><strong>Status:</strong> Pending</p>
        <p><strong>Payment ID:</strong> ${payment_id || "N/A"}</p>
        <hr />
        <p><strong>Shipping to:</strong><br/>
        ${name}<br/>
        ${phone}<br/>
        ${address}</p>
      `);
    } catch (err) {
      console.error("Email failed but order placed:", err.message);
    }

    res.send("Order Placed");
  } catch (err) {
    console.error(err);
    res.status(403).send("Invalid token");
  }
});


r.post("/admin/product", async (req, res) => {
  const { title, category, price, image } = req.body;


  await pool.query("INSERT INTO products SET ?", {
    title,
    category,
    price,
    image,
    created_at: new Date()
  });

  res.send("Product Added");
});

r.delete("/admin/product/:id", async (req, res) => {
  await pool.query("DELETE FROM products WHERE id=?", [req.params.id]);
  res.send("Product Deleted");
});

r.get("/my-orders", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("No token");

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC",
      [id]
    );
    res.json(orders);
  } catch {
    res.status(403).send("Invalid token");
  }
});
r.get("/admin/orders", async (req, res) => {
  const [orders] = await pool.query(`
    SELECT o.*, u.name AS user_name, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `);
  res.json(orders);
});

r.post("/admin/update-status", async (req, res) => {
  const { id, status } = req.body;

  try {
    await pool.query("UPDATE orders SET status=? WHERE id=?", [status, id]);

    const [[order]] = await pool.query("SELECT user_id FROM orders WHERE id=?", [id]);
    if (!order) return res.status(404).send("Order not found");

    const [[user]] = await pool.query("SELECT email, name FROM users WHERE id=?", [order.user_id]);
    if (!user) return res.status(404).send("User not found");

    await sendMail(
      user.email,
      "Order Status Update - ShopNext",
      `
        <h2>Hi ${user.name},</h2>
        <p>Your order <strong>#${id}</strong> status has been updated to:</p>
        <p style="font-size: 18px;"><strong>${status}</strong></p>
        <p>Thank you for shopping with us!</p>
      `
    );

    res.send("Status updated & email sent");
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).send("Failed to update or email");
  }
});
r.get("/admin/users", async (req, res) => {
  const users = await pool.query("SELECT name, email, created_at FROM users");
  res.json(users);
});

r.post("/create-payment", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt_order_" + Date.now()
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay error:", err);
    res.status(500).send({ error: "Something went wrong" });
  }
});

r.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
  if (rows.length) return res.status(400).send("Email already registered");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

  await sendMail(email, "Your OTP for ShopNext", `<h3>Your OTP is: ${otp}</h3>`);
  res.send("OTP Sent");
});

r.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otps.get(email);

  if (!record) return res.status(400).send("No OTP sent");
  if (Date.now() > record.expires) return res.status(400).send("OTP expired");
  if (record.otp !== otp) return res.status(400).send("Invalid OTP");

  res.send("OTP verified");
});

r.post("/send-reset-otp", async (req, res) => {
  const { email } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
  if (!rows.length) return res.status(400).send("user email not registered");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
  await sendMail(email, "OTP for Password Reset", `<h3>Your OTP is: ${otp}</h3>`);
  res.send("OTP sent to " + email);
});

r.post("/reset-password", async (req, res) => {
  const { email, otp, password } = req.body;
  const record = otps.get(email);
  if (!record) return res.status(400).send("No OTP sent");
  if (Date.now() > record.expires) return res.status(400).send("OTP expired");
  if (record.otp !== otp) return res.status(400).send("wrong otp");

  const hashed = await bcrypt.hash(password, 10);
  await pool.query("UPDATE users SET password=? WHERE email=?", [hashed, email]);
  otps.delete(email);

  await sendMail(email, "Password Changed for your ShopNext Account", `
    <h3>Your password has been changed</h3>
    <p>If you haven't done this, please contact <a href="http://localhost:5173/support">Customer Support</a> immediately.</p>
  `);

  res.send("Password Reset Successful");
});


r.get("/user/info", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("No token");

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const [[user]] = await pool.query("SELECT name, email FROM users WHERE id = ?", [id]);

    if (!user) return res.status(404).send("User not found");

    user.password = "******";
    res.json(user);
  } catch (err) {
    res.status(403).send("Invalid token");
  }
});


r.patch("/user/update", async (req, res) => {
  const token = req.headers.authorization;
  let { field, value } = req.body;

  if (!["name", "email", "password"].includes(field)) {
    return res.status(400).send("Invalid field");
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    if (field === "password") {
      const salt = await bcrypt.genSalt(10);
      value = await bcrypt.hash(value, salt);
    }

    const query = `UPDATE users SET ${field} = ? WHERE id = ?`;
    await pool.query(query, [value, id]);
    res.send("Updated");
  } catch (err) {
    res.status(403).send("Invalid token");
  }
});



r.delete("/user/delete", async (req, res) => {
  const token = req.headers.authorization;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.send("Deleted");
  } catch {
    res.status(403).send("Invalid token");
  }
});

r.post('/support', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminMail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Contact Form Submission from ShopNext',
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    const userReply = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for reaching out customer care!',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out! We've received your message and would love to get back to your service as soon as possible.</p>
        <p>Best regards,<br>ShopNext Team</p>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userReply);

    console.log('Emails sent successfully');
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});
r.get("/products", async (req, res) => {
  const category = req.query.category;

  try {
    if (!category) {
      const [allProducts] = await pool.query("SELECT * FROM products ORDER BY id DESC");
      return res.json(allProducts);
    }

    const [products] = await pool.query(
      "SELECT * FROM products WHERE category = ? ORDER BY id DESC",
      [category]
    );

    res.json(products);
  } catch (err) {
    console.error("Failed to fetch products by category:", err.message);
    res.status(500).send("Server error");
  }
});


export default r;
