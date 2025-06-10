require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET;
const ENC_KEY = crypto.scryptSync(process.env.ENCRYPTION_PASSWORD, 'salt', 32);
const IV = Buffer.alloc(16, 0);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) console.error("MySQL Error:", err);
  else console.log("MySQL Connected");
});

// Auth Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token missing" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// Encryption functions
function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, IV);
  return Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString("hex");
}

function decrypt(text) {
  const encryptedText = Buffer.from(text, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, IV);
  return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString("utf8");
}

// Register
app.post("/api/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ message: "All fields required" });

  const hashedPassword = await bcrypt.hash(password, 10);
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (result.length > 0) return res.status(400).json({ message: "User exists" });

    db.query("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)", [fullName, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: "Registration failed" });
      res.status(201).json({ message: "User registered" });
    });
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err || result.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

app.get("/api/user", authenticate, (req, res) => {
  db.query("SELECT email,full_name FROM users WHERE id = ?", [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "User fetch failed" });
    res.json(result[0]);
  });
});

app.post("/api/notes", authenticate, (req, res) => {
  const { title, content } = req.body;
  const encryptedTitle = encrypt(title);
  const encryptedContent = encrypt(content);
  db.query(
    "INSERT INTO notes (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())",
    [req.user.id, encryptedTitle, encryptedContent],
    (err) => {
      if (err) return res.status(500).json({ message: "Note save failed" });
      res.status(200).json({ message: "Note saved" });
    }
  );
});


app.get("/api/notes", authenticate, (req, res) => {
  db.query("SELECT id, title, content, created_at FROM notes WHERE user_id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching notes" });

    const decryptedNotes = results.map((note) => ({
      id: note.id,
      title: decrypt(note.title),
      content: decrypt(note.content),
      created_at: note.created_at,
    }));

    res.json(decryptedNotes);
  });
});


app.put("/api/notes/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const encryptedTitle = encrypt(title);
  const encryptedContent = encrypt(content);

  db.query(
    "UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?",
    [encryptedTitle, encryptedContent, id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Note updated" });
    }
  );
});


app.delete("/api/notes/:id", authenticate, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM notes WHERE id = ? AND user_id = ?", [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Note deleted" });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
