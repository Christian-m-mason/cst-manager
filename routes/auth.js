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
    const { email_address, password } = req.body;
    if (!(email_address && password)) {
      res.status(400).send({ message: "Missing Email or Password" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { rows } = await db.query(
      "INSERT INTO users(email_address,password_hash) VALUES ($1,$2) ON CONFLICT (email_address) DO NOTHING RETURNING *;",
      [email_address, hashedPassword]
    );
    if (!rows[0]) {
      return res
        .status(409)
        .send({ message: "User Already Exists. Please Login" });
    }
    const token = await jwt.sign(
      { user_id: rows[0].id, email_address: rows[0].email_address },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    res.status(201).send({
      message: "User Created",
      user: {
        id: rows[0].id,
        email_address: rows[0].email_address,
        token: token,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// Authenticate user

router.get("/signin", async (req, res) => {
  const { email_address, password } = req.body;
  try {
    const { rows } = await db.query(
      "SELECT * FROM users WHERE email_address = $1",
      [email_address]
    );
    const isValidPass = await bcrypt.compare(password, rows[0].password_hash);
    if (!rows || !isValidPass) {
      res.status(401).send({
        message: "User or password incorrect ",
      });
    }
    res.status(200).send({
      message: "User authenticated!",
      user_id: rows[0].id,
      token: "Future Auth Token",
    });
  } catch (err) {
    console.log(err);
  }
});
