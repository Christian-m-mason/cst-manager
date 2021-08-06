const Router = require("express-promise-router");
const db = require("../db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const router = new Router();

module.exports = router;

// Create new user

router.post("/signup", async (req, res) => {
  const { email_address, password } = req.body;
  const password_hash = await bcrypt.hash(password, saltRounds);
  try {
    const resp = await db.query(
      "INSERT INTO users (email_address, password_hash) VALUES($1,$2) ON CONFLICT (email_address) DO NOTHING RETURNING *;",
      [email_address, password_hash]
    );
    if (!resp.rowCount) {
      res.status(401).send({
        message: "User already exists",
      });
    } else {
      res.status(201).send({
        message: "User Created!",
        user: {
          id: resp.rows[0].id,
          email_address: resp.rows[0].email_address,
        },
      });
    }
  } catch (err) {
    console.error(err.stack);
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
