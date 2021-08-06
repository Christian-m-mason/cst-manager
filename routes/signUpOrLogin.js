const Router = require("express-promise-router");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const router = new Router();

module.exports = router;

// Create new user

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send({ message: "Missing Email or Password" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { rows } = await db.query(
      "INSERT INTO users(email,password_hash) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING RETURNING *;",
      [email, hashedPassword]
    );
    if (!rows[0]) {
      return res
        .status(409)
        .send({ message: "User Already Exists. Please Login" });
    }
    const token = await jwt.sign(
      { user_id: rows[0].id, email: rows[0].email_address },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    res.status(201).send({
      message: "User Created",
      user: {
        id: rows[0].id,
        email: rows[0].email,
        token: token,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// Authenticate user

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send({ message: "Missing Email or Password" });
    }
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows[0] && (await bcrypt.compare(password, rows[0].password_hash))) {
      const token = await jwt.sign(
        { user_id: rows[0].id, email: rows[0].email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      res.status(200).send({
        message: "User Authenticated!",
        user: {
          id: rows[0].id,
          email: rows[0].email,
          token: token,
        },
      });
    }
    res.status(400).send({ message: "Invalid Credentials" });
  } catch (err) {
    console.log(err);
  }
});
