const Router = require("express-promise-router");
const db = require("../db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const router = new Router();

module.exports = router;

// Get ALL Users

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM users;");
  res.send(rows);
});

// Get User by ID

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  res.send(rows[0]);
});

// Get user profile by ID

router.get("/:id/profile", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    `
  SELECT * FROM users  u
  LEFT JOIN profile p ON p.user_id = u.id
  LEFT JOIN rank r ON r.id = p.rank_id
  LEFT JOIN branch b ON b.id = p.branch_id
  LEFT JOIN position po ON po.id = p.position_id
  WHERE u.id = $1
  `,
    [id]
  );
  res.send(rows[0]);
});

//Create User Profile
